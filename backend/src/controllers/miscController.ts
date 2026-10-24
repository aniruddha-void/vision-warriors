import { Response } from 'express';
import { ReviewModel, VisitModel, SentOfferModel } from '../models/Interactions.js';
import { ConsentLogModel, AuditLogModel, SettingsModel } from '../models/LogsAndSettings.js';
import { CustomerModel } from '../models/Customer.js';
import { TaskModel, ActionModel, TemplateModel } from '../models/Campaigns.js';
import { User } from '../models/User.js';
import {
  initialCustomers,
  initialVisits,
  initialReviews,
  initialSentOffers,
  initialActions,
  initialTasks,
  initialTemplates,
  initialConsentLogs,
  initialAuditLogs,
  initialSettings,
} from '../data/seedData.js';
import { AuthRequest, getTenantShopId } from '../middleware/auth.js';

// --- Reviews ---
export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'staff' || role === 'auditor') {
      res.status(403).json({ success: false, message: `Forbidden: role '${role}' cannot access store reviews` });
      return;
    }

    const shopId = getTenantShopId(req);
    const reviews = await ReviewModel.find({ shopId }).sort({ date: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { customerId, customerName, rating, comment } = req.body;
    const shopId = req.body.shopId || getTenantShopId(req);

    if (!customerId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'customerId, rating, and comment are required' });
      return;
    }

    const review = await ReviewModel.create({
      id: `rev-${Date.now()}`,
      shopId,
      customerId,
      customerName: customerName || 'Patron',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- Logs ---
export async function getConsentLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'staff') {
      res.status(403).json({ success: false, message: 'Forbidden: staff role cannot view consent logs' });
      return;
    }

    const shopId = getTenantShopId(req);
    const logs = await ConsentLogModel.find({ shopId }).sort({ timestamp: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'staff') {
      res.status(403).json({ success: false, message: 'Forbidden: staff role cannot view audit trail logs' });
      return;
    }

    const shopId = getTenantShopId(req);
    const logs = await AuditLogModel.find({ shopId }).sort({ timestamp: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- Settings ---
export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'staff' || role === 'auditor') {
      res.status(403).json({ success: false, message: `Forbidden: role '${role}' cannot access shop configuration` });
      return;
    }

    const shopId = getTenantShopId(req);
    let settings = await SettingsModel.findOne({ shopId });
    if (!settings) {
      settings = await SettingsModel.create({
        ...initialSettings,
        shopId,
        shopName: shopId === 'chai-and-co' ? 'Chai & Co' : 'My Retail Shop',
      });
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    // STRICT ROLE ACCESS: Only Owner can update shop configuration
    if (role !== 'owner') {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${role}' cannot modify shop settings. Owner access required.`,
      });
      return;
    }

    const shopId = getTenantShopId(req);
    const update = { ...req.body };
    delete update.shopId; // Prevent changing shopId identifier!

    let settings = await SettingsModel.findOneAndUpdate(
      { shopId },
      { $set: update },
      { new: true, upsert: true }
    );

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp: new Date().toISOString(),
      user: req.user ? `${req.user.name} (Owner)` : 'Administrator',
      role: 'owner',
      action: 'Store settings updated',
      details: 'Updated shop settings and classification rules.',
    });

    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- Seeder ---
export async function seedDatabase(req?: AuthRequest, res?: Response): Promise<void> {
  try {
    // If called via HTTP API, require owner role
    if (req?.user && req.user.role !== 'owner') {
      res?.status(403).json({ success: false, message: 'Forbidden: only owner can seed database' });
      return;
    }

    const targetShopId = req ? getTenantShopId(req) : 'chai-and-co';

    // Drop legacy id_1 unique index if it existed previously from un-versioned collections
    try {
      await CustomerModel.collection.dropIndex('id_1');
    } catch (_e) {}

    // Clear records for target shop or un-tagged legacy records
    const deleteFilter = { $or: [{ shopId: targetShopId }, { shopId: { $exists: false } }] };
    await CustomerModel.deleteMany(deleteFilter);
    await VisitModel.deleteMany(deleteFilter);
    await ReviewModel.deleteMany(deleteFilter);
    await SentOfferModel.deleteMany(deleteFilter);
    await ActionModel.deleteMany(deleteFilter);
    await TaskModel.deleteMany(deleteFilter);
    await TemplateModel.deleteMany(deleteFilter);
    await ConsentLogModel.deleteMany(deleteFilter);
    await AuditLogModel.deleteMany(deleteFilter);
    await SettingsModel.deleteMany(deleteFilter);

    // Prepare records with explicit shopId
    const taggedCustomers = initialCustomers.map((c) => ({ ...c, shopId: targetShopId }));
    const taggedVisits = initialVisits.map((v) => ({ ...v, shopId: targetShopId }));
    const taggedReviews = initialReviews.map((r) => ({ ...r, shopId: targetShopId }));
    const taggedSentOffers = initialSentOffers.map((o) => ({ ...o, shopId: targetShopId }));
    const taggedActions = initialActions.map((a) => ({ ...a, shopId: targetShopId }));
    const taggedTasks = initialTasks.map((t) => ({ ...t, shopId: targetShopId }));
    const taggedTemplates = initialTemplates.map((tp) => ({ ...tp, shopId: targetShopId }));
    const taggedConsentLogs = initialConsentLogs.map((cl) => ({ ...cl, shopId: targetShopId }));
    const taggedAuditLogs = initialAuditLogs.map((al) => ({ ...al, shopId: targetShopId }));

    await CustomerModel.insertMany(taggedCustomers);
    await VisitModel.insertMany(taggedVisits);
    await ReviewModel.insertMany(taggedReviews);
    await SentOfferModel.insertMany(taggedSentOffers);
    await ActionModel.insertMany(taggedActions);
    await TaskModel.insertMany(taggedTasks);
    await TemplateModel.insertMany(taggedTemplates);
    await ConsentLogModel.insertMany(taggedConsentLogs);
    await AuditLogModel.insertMany(taggedAuditLogs);
    await SettingsModel.create({ ...initialSettings, shopId: targetShopId });

    // Ensure demo accounts exist in database
    const demoAccounts = [
      { email: 'amanda@chaiandco.com', name: 'Amanda (Owner)', role: 'owner', pass: 'DemoOwner2026!' },
      { email: 'karan@chaiandco.com', name: 'Karan (Manager)', role: 'manager', pass: 'DemoManager2026!' },
      { email: 'rahul@chaiandco.com', name: 'Rahul (Staff)', role: 'staff', pass: 'DemoStaff2026!' },
      { email: 'priya@chaiandco.com', name: 'Priya (Auditor)', role: 'auditor', pass: 'DemoAuditor2026!' },
    ];

    for (const d of demoAccounts) {
      const existing = await User.findOne({ email: d.email });
      if (!existing) {
        const u = new User({
          email: d.email,
          password: d.pass,
          name: d.name,
          role: d.role,
          shopId: 'chai-and-co',
          isDemo: true,
        });
        await u.save();
      }
    }

    console.log(`[Seed] Database seeded for shop '${targetShopId}' with initial mock records and verified demo accounts.`);
    if (res) {
      res.json({ success: true, message: `Database seeded for shop '${targetShopId}' successfully` });
    }
  } catch (error: any) {
    console.error('[Seed Error]:', error);
    if (res) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
