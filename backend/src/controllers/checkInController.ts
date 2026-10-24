import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer.js';
import { VisitModel, ReviewModel } from '../models/Interactions.js';
import { ConsentLogModel, AuditLogModel, SettingsModel } from '../models/LogsAndSettings.js';
import { classify, defaultCategoryThresholds } from '../services/segmentation.js';
import { CustomerConsent } from '../types/index.js';

export async function handleCheckIn(req: Request, res: Response): Promise<void> {
  try {
    const { contact, name, review, rating } = req.body;
    const consentGranted = req.body.consentGranted !== undefined 
      ? Boolean(req.body.consentGranted) 
      : Boolean(req.body.consentGiven);
    const shopId = req.body.shopId || req.params.shopId || 'chai-and-co';

    if (!contact || typeof contact !== 'string' || !contact.trim()) {
      res.status(400).json({ success: false, message: 'Valid contact (phone or email) is required' });
      return;
    }

    const raw = contact.trim();
    const isEmail = raw.includes('@');
    const normalizedEmail = isEmail ? raw.toLowerCase() : '';
    const normalizedPhone = !isEmail ? raw.replace(/\D/g, '') : '';
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];

    // Fetch store settings for thresholds and shop name
    const settings = await SettingsModel.findOne({ shopId });
    const thresholds = settings?.categoryThresholds || defaultCategoryThresholds;
    const shopName = settings?.shopName || 'Chai & Co';

    // Find existing customer scoped to this shop
    let query: any = { shopId };
    if (isEmail) {
      query.email = normalizedEmail;
    } else {
      query.phone = normalizedPhone;
    }

    let customer = await CustomerModel.findOne(query);
    let isNew = false;

    if (customer) {
      // Existing customer
      customer.visitCount += 1;
      customer.visitsPerMonth += 1;
      customer.lastVisit = dateStr;
      customer.lastVisitDaysAgo = 0;
      if (name && name.trim()) {
        customer.name = name.trim();
      }

      if (consentGranted) {
        customer.consent.personalisedOffers = true;
        customer.consent.updatedAt = timestamp;
      }

      const classification = classify(customer, thresholds);
      customer.category = classification.category;
      customer.needsAttention = classification.needsAttention;

      await customer.save();
    } else {
      // New customer: generate collision-free unique customer ID
      isNew = true;
      let candidateNum = 1000 + (await CustomerModel.countDocuments({ shopId })) + 1;
      let newId = `C-${candidateNum}`;
      while (await CustomerModel.findOne({ id: newId, shopId })) {
        candidateNum++;
        newId = `C-${candidateNum}`;
      }

      const initialConsent: CustomerConsent = {
        purchaseHistory: Boolean(consentGranted),
        visitFrequency: Boolean(consentGranted),
        emailOffers: Boolean(consentGranted && isEmail),
        smsOffers: Boolean(consentGranted && !isEmail),
        location: false,
        personalisedOffers: Boolean(consentGranted),
        channels: {
          whatsapp: !isEmail,
          sms: !isEmail,
          email: isEmail,
        },
        updatedAt: timestamp,
      };

      const classification = classify(
        { visitCount: 1, lastVisitDaysAgo: 0, visitsPerMonth: 1 },
        thresholds
      );

      customer = new CustomerModel({
        id: newId,
        shopId,
        name: name && name.trim() ? name.trim() : (isEmail ? raw.split('@')[0] : `Guest ${newId}`),
        phone: normalizedPhone,
        email: normalizedEmail,
        firstVisit: dateStr,
        lastVisit: dateStr,
        lastVisitDaysAgo: 0,
        visitCount: 1,
        visitsPerMonth: 1,
        avgSpend: 250,
        favouriteCategory: 'Masala Chai',
        preferredChannel: isEmail ? 'email' : 'whatsapp',
        consent: initialConsent,
        category: classification.category,
        needsAttention: classification.needsAttention,
      });

      await customer.save();

      // Log consent granting event if patron consented
      if (consentGranted) {
        await ConsentLogModel.create({
          id: `log-${Date.now()}`,
          shopId,
          customerId: customer.id,
          eventType: 'Granted',
          timestamp,
          purposes: ['Personalised offers', 'Purchase history', 'Visit frequency'],
          channels: isEmail ? ['Email'] : ['WhatsApp', 'SMS'],
          details: `Master consent granted during counter check-in at ${shopName}.`,
        });
      }
    }

    // Record visit interaction
    const visit = await VisitModel.create({
      id: `v-${Date.now()}`,
      shopId,
      customerId: customer.id,
      date: dateStr,
      review: review || '',
      rating: rating || 5,
      spend: 250,
    });

    let reviewDoc = null;
    if (review && review.trim()) {
      reviewDoc = await ReviewModel.create({
        id: `rev-${Date.now()}`,
        shopId,
        customerId: customer.id,
        customerName: customer.name,
        rating: rating || 5,
        comment: review.trim(),
        date: dateStr,
      });
    }

    // Log audit action
    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp,
      user: 'Patron Self-Service (QR)',
      role: 'customer',
      action: isNew ? 'New Customer Check-in' : 'Repeat Visit Logged',
      details: `${customer.name} (${customer.id}) checked in. Total visits: ${customer.visitCount}. Category: ${customer.category}.`,
    });

    res.json({
      success: true,
      isNew,
      customer,
      visit,
      review: reviewDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
