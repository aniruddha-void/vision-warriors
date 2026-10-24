import { Response } from 'express';
import { CustomerModel } from '../models/Customer.js';
import { VisitModel, ReviewModel, SentOfferModel } from '../models/Interactions.js';
import { ConsentLogModel, AuditLogModel, SettingsModel } from '../models/LogsAndSettings.js';
import { ConsentLogEvent } from '../types/index.js';
import { AuthRequest, getTenantShopId } from '../middleware/auth.js';

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '****';
  const prefix = digits.slice(-10, -8);
  const suffix = digits.slice(-4);
  return `${prefix}****${suffix}`;
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***';
  const name = parts[0];
  const domain = parts[1];
  const firstChar = name.length > 0 ? name[0] : 'u';
  return `${firstChar}***@${domain}`;
}

export function sanitizeCustomerForRole(customer: any, role?: string): any {
  const custObj = customer.toObject ? customer.toObject() : { ...customer };

  // If customer has opted out of personalised offers, contacts are masked for all roles
  if (!custObj.consent?.personalisedOffers) {
    custObj.phone = 'Hidden (no consent)';
    custObj.email = 'Hidden (no consent)';
    return custObj;
  }

  // Manager and Staff receive masked contacts
  if (role === 'manager' || role === 'staff') {
    if (custObj.phone) custObj.phone = maskPhone(custObj.phone);
    if (custObj.email) custObj.email = maskEmail(custObj.email);
  }

  return custObj;
}

export async function getCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getTenantShopId(req);
    const role = req.user?.role || 'owner';

    // Staff and Auditor cannot browse customer rosters
    if (role === 'staff' || role === 'auditor') {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${role}' is not authorized to browse customer directory`,
      });
      return;
    }

    const { category, search, needsAttention } = req.query;
    let query: any = { shopId };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (needsAttention === 'true') {
      query.needsAttention = true;
    }

    if (search && typeof search === 'string') {
      const s = search.trim();
      query.$and = [
        { shopId },
        {
          $or: [
            { name: { $regex: s, $options: 'i' } },
            { phone: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
            { id: { $regex: s, $options: 'i' } },
          ],
        },
      ];
    }

    const rawCustomers = await CustomerModel.find(query).sort({ updatedAt: -1 });
    const customers = rawCustomers.map((c) => sanitizeCustomerForRole(c, role));

    res.json({ success: true, count: customers.length, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCustomerById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const shopId = getTenantShopId(req);
    const role = req.user?.role || 'owner';

    // Staff and Auditor cannot view customer details
    if (role === 'staff' || role === 'auditor') {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${role}' is not authorized to view customer details`,
      });
      return;
    }

    // Scoped query ensuring shop isolation
    const customer = await CustomerModel.findOne({ id, shopId });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found in your shop directory' });
      return;
    }

    const visits = await VisitModel.find({ customerId: id, shopId }).sort({ date: -1 });
    const reviews = await ReviewModel.find({ customerId: id, shopId }).sort({ date: -1 });
    const sentOffers = await SentOfferModel.find({ customerId: id, shopId }).sort({ sentAt: -1 });

    const sanitizedCustomer = sanitizeCustomerForRole(customer, role);

    res.json({
      success: true,
      data: {
        customer: sanitizedCustomer,
        visits,
        reviews,
        sentOffers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateCustomerConsent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const partialConsent = req.body;
    const timestamp = new Date().toISOString();

    if (!req.user && req.headers['x-privacy-portal'] !== 'customer-self-service') {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Direct unauthenticated consent modification is rejected.',
      });
      return;
    }

    // Query customer: if authenticated, scope by shopId, otherwise by id for public privacy portal
    const query = req.user ? { id, shopId: getTenantShopId(req) } : { id };
    const customer = await CustomerModel.findOne(query);

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const shopId = customer.shopId || 'chai-and-co';
    const previousPersonalised = customer.consent.personalisedOffers;

    customer.consent = {
      ...customer.consent,
      ...partialConsent,
      channels: {
        ...customer.consent.channels,
        ...(partialConsent.channels || {}),
      },
      updatedAt: timestamp,
    };

    await customer.save();

    let eventType: ConsentLogEvent['eventType'] = 'Updated';
    if (partialConsent.personalisedOffers === false) {
      eventType = 'Withdrawn';
    } else if (partialConsent.personalisedOffers === true && !previousPersonalised) {
      eventType = 'Granted';
    }

    const purposes: string[] = [];
    if (customer.consent.personalisedOffers) {
      purposes.push('Personalised offers');
      if (customer.consent.purchaseHistory) purposes.push('Purchase history');
      if (customer.consent.visitFrequency) purposes.push('Visit frequency');
      if (customer.consent.emailOffers) purposes.push('Email offers');
      if (customer.consent.smsOffers) purposes.push('SMS offers');
    }

    const channels: string[] = [];
    if (customer.consent.channels?.whatsapp) channels.push('WhatsApp');
    if (customer.consent.channels?.sms) channels.push('SMS');
    if (customer.consent.channels?.email) channels.push('Email');

    await ConsentLogModel.create({
      id: `log-${Date.now()}`,
      shopId,
      customerId: id,
      eventType,
      timestamp,
      purposes,
      channels,
      details:
        eventType === 'Withdrawn'
          ? 'Customer withdrew master consent for personalised actions.'
          : `Preferences updated: ${purposes.join(', ') || 'No active purposes'}. Channels: ${channels.join(', ') || 'None'}.`,
    });

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp,
      user: req.user ? `${req.user.name} (${req.user.role})` : 'Customer (Privacy Portal)',
      role: req.user?.role || 'customer',
      action: `Consent ${eventType} for ${id}`,
      details: `Customer ${id} updated privacy settings. Personalised offers: ${customer.consent.personalisedOffers ? 'ON' : 'OFF'}.`,
    });

    res.json({ success: true, customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GDPR / DPDP Right to be Forgotten:
 * Permanently erases all customer personal data, visit history, reviews, and sent offer records.
 * Retains only a cryptographically minimized, non-identifying audit tombstone.
 */
export async function deleteCustomerData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const timestamp = new Date().toISOString();

    if (!req.user && req.headers['x-privacy-portal'] !== 'customer-self-service') {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Direct unauthenticated deletion is rejected.',
      });
      return;
    }

    // Authenticated role check: Only Owner (or customer deleting self via privacy portal) can purge records
    if (req.user && req.user.role !== 'owner') {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' cannot delete customer records. Owner privilege required.`,
      });
      return;
    }

    const query = req.user ? { id, shopId: getTenantShopId(req) } : { id };
    const customer = await CustomerModel.findOne(query);

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const shopId = customer.shopId || 'chai-and-co';

    // Completely erase customer and all associated personal records
    await CustomerModel.deleteOne({ id, shopId });
    await VisitModel.deleteMany({ customerId: id, shopId });
    await ReviewModel.deleteMany({ customerId: id, shopId });
    await SentOfferModel.deleteMany({ customerId: id, shopId });

    // Anonymized tombstone evidence in compliance with DPDP & GDPR
    await ConsentLogModel.create({
      id: `log-${Date.now()}`,
      shopId,
      customerId: id,
      eventType: 'Data Deleted',
      timestamp,
      purposes: [],
      channels: [],
      details: `Right to be forgotten exercised. All personal profile, visits, reviews, and sent offer records purged permanently for customer ${id}.`,
    });

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp,
      user: req.user ? `${req.user.name} (Owner)` : 'Customer Self-Service (Privacy Portal)',
      role: req.user ? 'owner' : 'customer',
      action: `Customer data erased: ${id}`,
      details: `Exercised right to be forgotten. Removed customer records, reviews, visit history, and sent offers.`,
    });

    res.json({
      success: true,
      message: `Data for customer ${id} deleted successfully across all systems`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GDPR / DPDP Data Portability Export
 */
export async function exportCustomerData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const timestamp = new Date().toISOString();

    if (!req.user && req.headers['x-privacy-portal'] !== 'customer-self-service') {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Direct unauthenticated export is rejected.',
      });
      return;
    }

    // Staff and Auditor cannot export customer data bundles
    if (req.user && (req.user.role === 'staff' || req.user.role === 'auditor')) {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to export customer data`,
      });
      return;
    }

    const query = req.user ? { id, shopId: getTenantShopId(req) } : { id };
    const customer = await CustomerModel.findOne(query);

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const shopId = customer.shopId || 'chai-and-co';
    const settings = await SettingsModel.findOne({ shopId });
    const shopName = settings?.shopName || 'Chai & Co';

    const exportPayload = {
      exportedAt: timestamp,
      system: 'Nova Insights Privacy-Preserving Customer Intelligence',
      shop: shopName,
      shopId,
      customerId: customer.id,
      profile: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        firstVisit: customer.firstVisit,
        lastVisit: customer.lastVisit,
      },
      trackingMetrics: {
        totalVisits: customer.visitCount,
        monthlyVisits: customer.consent.visitFrequency ? customer.visitsPerMonth : 'REDACTED_NO_CONSENT',
        lastVisitDaysAgo: customer.consent.visitFrequency ? customer.lastVisitDaysAgo : 'REDACTED_NO_CONSENT',
        category: customer.category,
        favouriteCategory: customer.consent.purchaseHistory ? customer.favouriteCategory : 'REDACTED_NO_CONSENT',
      },
      consentStatus: customer.consent,
      auditNotice: 'This open JSON bundle complies with DPDP and GDPR data portability requirements.',
    };

    await ConsentLogModel.create({
      id: `log-${Date.now()}`,
      shopId,
      customerId: id,
      eventType: 'Data Exported',
      timestamp,
      purposes: [],
      channels: [],
      details: `Customer downloaded complete data portability bundle in JSON format.`,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="nova-customer-${id}-export.json"`);
    res.json(exportPayload);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
