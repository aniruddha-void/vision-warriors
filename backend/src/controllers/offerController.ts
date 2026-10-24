import { Response } from 'express';
import { CustomerModel } from '../models/Customer.js';
import { SentOfferModel } from '../models/Interactions.js';
import { AuditLogModel, SettingsModel } from '../models/LogsAndSettings.js';
import { evaluateOfferEligibility, defaultCategoryThresholds, classify } from '../services/segmentation.js';
import { sendOfferEmail, verifyEmailConfig } from '../services/emailService.js';
import { CustomerCategory } from '../types/index.js';
import { AuthRequest, getTenantShopId } from '../middleware/auth.js';

export async function sendOffer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role !== 'owner' && role !== 'manager') {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${role}' cannot dispatch category marketing campaigns`,
      });
      return;
    }

    const { category, channel, customMessage } = req.body;
    if (!category || !channel) {
      res.status(400).json({ success: false, message: 'Category and channel are required' });
      return;
    }

    const shopId = getTenantShopId(req);
    const settings = await SettingsModel.findOne({ shopId });
    const thresholds = settings?.categoryThresholds || defaultCategoryThresholds;
    const shopName = settings?.shopName || 'Chai & Co';
    const timestamp = new Date().toISOString();

    // Query only customers belonging to this shop
    const customers = await CustomerModel.find({ shopId });

    let sentCount = 0;
    let excludedCount = 0;
    const newOfferRecords = [];

    let emailsAttempted = 0;
    let emailsSent = 0;
    let emailsSimulated = 0;
    let emailsFailed = 0;

    for (const c of customers) {
      const eligibility = evaluateOfferEligibility(c as any, category as CustomerCategory, channel, thresholds);

      if (eligibility.eligible) {
        sentCount++;
        const discountCode = category === 'NEW' ? 'WELCOME10' : category === 'REGULAR' ? 'FREE-ITEM' : 'COMEBACK20';

        if (channel === 'email') {
          emailsAttempted++;
          try {
            const emailResult = await sendOfferEmail({
              customer: c as any,
              category: category as CustomerCategory,
              discountCode,
              shopName,
              customMessage,
            });

            if (emailResult.sent) {
              emailsSent++;
              if (emailResult.simulated) {
                emailsSimulated++;
              }
            } else {
              emailsFailed++;
            }
          } catch (err: any) {
            emailsFailed++;
            console.error(`[OfferController] Failed sending email to customer ${c.id}:`, err?.message || err);
          }
        }

        newOfferRecords.push({
          id: `sent-${Date.now()}-${c.id}`,
          shopId,
          customerId: c.id,
          type: category === 'NEW' ? 'welcome' : category === 'REGULAR' ? 'loyalty' : 'winback',
          category,
          channel,
          sentAt: timestamp,
          status: 'Sent',
          title: `${category} Automated Reward Offer`,
          discount: discountCode,
        });
      } else {
        if (classify(c as any, thresholds).category === category) {
          excludedCount++;
        }
      }
    }

    if (newOfferRecords.length > 0) {
      await SentOfferModel.insertMany(newOfferRecords);
    }

    let auditDetail = `Dispatched ${category} category offer to ${sentCount} consented patrons via ${channel.toUpperCase()}. ${excludedCount} excluded due to privacy preferences or missing contact info.`;
    if (channel === 'email') {
      auditDetail += ` Email results: ${emailsSent} delivered${emailsSimulated > 0 ? ' (simulated)' : ''}, ${emailsFailed} failed.`;
    }

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp,
      user: req.user ? `${req.user.name} (${req.user.role})` : 'Campaign Dispatcher',
      role: req.user?.role || 'owner',
      action: `Dispatched ${category} Category Offer`,
      details: auditDetail,
    });

    res.json({
      success: true,
      sentCount,
      excludedCount,
      totalCategoryMatches: sentCount + excludedCount,
      emailStats: channel === 'email' ? {
        attempted: emailsAttempted,
        sent: emailsSent,
        simulated: emailsSimulated,
        failed: emailsFailed,
      } : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSentOffers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'staff' || role === 'auditor') {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${role}' cannot view sent offers history`,
      });
      return;
    }

    const shopId = getTenantShopId(req);
    const offers = await SentOfferModel.find({ shopId }).sort({ sentAt: -1 });
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkEmailStatus(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const status = await verifyEmailConfig();
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function sendTestEmail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role !== 'owner') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: only shop owners may send SMTP verification emails',
      });
      return;
    }

    const { to } = req.body;
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid recipient email address is required' });
      return;
    }

    const { sendEmail } = await import('../services/emailService.js');
    const result = await sendEmail({
      to: to.trim(),
      subject: 'Nova Insights - Test Email Verification ☕',
      text: 'This is a test email sent from Nova Insights Nodemailer integration. Your SMTP setup is working correctly!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #F9FAFB; border-radius: 12px; border: 1px solid #E5E7EB; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1E1B4B; margin-top: 0;">Nova Insights Email Verification ☕</h2>
          <p style="color: #374151; font-size: 15px;">Your Nodemailer Gmail SMTP integration is working successfully!</p>
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 12px 16px; border-radius: 8px; font-weight: 600;">
            ✅ SMTP Connection & Authentication Active
          </div>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    res.json({ success: result.sent, result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
