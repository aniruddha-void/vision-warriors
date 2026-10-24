import nodemailer, { Transporter } from 'nodemailer';
import { Customer, CustomerCategory } from '../types/index.js';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendOfferEmailParams {
  customer: Customer;
  category: CustomerCategory;
  discountCode: string;
  shopName: string;
  customMessage?: string;
  validityText?: string;
}

export interface EmailSendResult {
  sent: boolean;
  simulated?: boolean;
  reason?: string;
  messageId?: string;
}

/**
 * Creates and returns the Nodemailer Transporter instance.
 * Reuses the singleton instance across requests.
 */
let transporterInstance: Transporter | null = null;

export function getEmailTransporter(): Transporter | null {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
      // Timeout settings to prevent hung connections
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return transporterInstance;
}

/**
 * Verifies if the email service has credentials configured and can connect to SMTP.
 */
export async function verifyEmailConfig(): Promise<{ configured: boolean; verified: boolean; message: string }> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    return {
      configured: false,
      verified: false,
      message: 'EMAIL_USER or EMAIL_PASS not set in environment variables',
    };
  }

  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      return { configured: false, verified: false, message: 'Could not initialize transporter' };
    }
    await transporter.verify();
    return { configured: true, verified: true, message: 'SMTP connection verified successfully' };
  } catch (error: any) {
    console.error('[EmailService] SMTP verification failed:', error?.message || error);
    return {
      configured: true,
      verified: false,
      message: `SMTP verification failed: ${error?.message || 'Check email credentials'}`,
    };
  }
}

/**
 * Core email sender with error handling and secure logging.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailSendResult> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  const from = process.env.EMAIL_FROM?.trim() || user || 'Nova Insights <no-reply@novainsights.com>';

  // If credentials are not set, simulate sending in development/testing
  if (!user || !pass) {
    console.log(
      `[EmailService] (Simulated) Email to: ${maskEmail(options.to)} | Subject: "${options.subject}" [Configure EMAIL_USER/EMAIL_PASS in .env to send live emails]`
    );
    return {
      sent: true,
      simulated: true,
      reason: 'SMTP credentials not configured. Email simulated in development mode.',
    };
  }

  // Safeguard: Prevent real SMTP bounces when sending to dummy example/test domains
  const isMockDomain =
    options.to.endsWith('@example.com') ||
    options.to.endsWith('@example.org') ||
    options.to.endsWith('@example.net') ||
    options.to.endsWith('@test.com') ||
    options.to.endsWith('@localhost');

  if (isMockDomain) {
    console.log(
      `[EmailService] (Simulated - Mock Domain) Dispatched to: ${maskEmail(options.to)} | Subject: "${options.subject}"`
    );
    return {
      sent: true,
      simulated: true,
      reason: 'Simulated dispatch for reserved example/test domain to protect sender reputation.',
    };
  }

  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      throw new Error('Email transporter could not be initialized');
    }

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`[EmailService] Email dispatched successfully to: ${maskEmail(options.to)} | MessageId: ${info.messageId}`);
    return {
      sent: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (error: any) {
    // Log error message without leaking credentials or tokens
    console.error(`[EmailService] Failed to send email to ${maskEmail(options.to)}:`, error?.message || 'Unknown error');
    return {
      sent: false,
      reason: error?.message || 'Email delivery failed',
    };
  }
}

/**
 * Send an offer email to a customer with strict privacy consent and personalization checks.
 */
export async function sendOfferEmail(params: SendOfferEmailParams): Promise<EmailSendResult> {
  const { customer, category, discountCode, shopName, customMessage, validityText } = params;

  // 1. Contact validation
  if (!customer.email || !customer.email.trim()) {
    return {
      sent: false,
      reason: `Customer ${customer.id} has no email address on file.`,
    };
  }

  // 2. Consent validation: Master toggle & marketing permissions
  const consent = customer.consent;
  if (!consent) {
    return {
      sent: false,
      reason: `Customer ${customer.id} has no consent record.`,
    };
  }

  // Channel consent check
  if (!consent.channels?.email) {
    return {
      sent: false,
      reason: `Customer ${customer.id} has opted out of Email channel messages.`,
    };
  }

  // Email promotional offers consent check
  if (consent.emailOffers === false) {
    return {
      sent: false,
      reason: `Customer ${customer.id} has disabled promotional email offers.`,
    };
  }

  // Master consent check: If customer withdrew master consent, marketing messages must not be sent
  if (consent.personalisedOffers === false && !customMessage) {
    return {
      sent: false,
      reason: `Customer ${customer.id} has withdrawn consent for promotional offers.`,
    };
  }

  // 3. Personalization logic based on consent
  const isPersonalized = Boolean(consent.personalisedOffers);
  const allowPurchaseHistory = Boolean(consent.purchaseHistory);

  const firstName = isPersonalized && customer.name && customer.name.trim()
    ? customer.name.trim().split(' ')[0]
    : 'Valued Guest';

  const favoriteMention =
    isPersonalized && allowPurchaseHistory && customer.favouriteCategory
      ? customer.favouriteCategory
      : 'our signature handcrafted beverages and treats';

  const validity = validityText || (category === 'IRREGULAR' ? 'Valid for 7 days' : 'Valid for 14 days');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const consentPortalUrl = `${frontendUrl}/consent/${customer.id}`;

  // 4. Construct Subject & Content
  let subject = '';
  let plainText = '';
  let headline = '';
  let bodyCopy = '';

  if (category === 'NEW') {
    headline = 'Welcome to the Family!';
    subject = isPersonalized
      ? `Welcome to ${shopName}, ${firstName}! ☕ Here is 10% off your next visit`
      : `Welcome to ${shopName}! ☕ Special 10% Welcome Offer`;
    bodyCopy = isPersonalized
      ? `Thank you for stopping by ${shopName}. We would love to brew your next cup: take 10% off your entire next order with your welcome voucher!`
      : `Thank you for visiting ${shopName}. We would love to welcome you back: take 10% off your entire next order with your welcome voucher!`;
  } else if (category === 'REGULAR') {
    headline = 'A Treat For Being One Of Our Best!';
    subject = isPersonalized
      ? `${firstName}, thank you for your loyalty to ${shopName}! 🍵 Free treat on us`
      : `Thank you for your loyalty to ${shopName}! 🍵 Free milestone reward`;
    bodyCopy = isPersonalized
      ? `You make ${shopName} feel vibrant every week! As a token of our gratitude, enjoy a complimentary snack or treat on your next visit.`
      : `Thank you for being part of the ${shopName} community! Enjoy a complimentary treat on your next visit with our milestone reward voucher.`;
  } else {
    // IRREGULAR / Win-back
    headline = 'We Miss Seeing You!';
    subject = isPersonalized
      ? `We saved your favorite table at ${shopName}, ${firstName} ☕ (20% Off Inside)`
      : `We miss you at ${shopName} ☕ Special 20% comeback voucher inside`;
    bodyCopy = isPersonalized
      ? `We noticed it has been a little while! Your favorite ${favoriteMention} is steaming hot and waiting. Drop by this week and take 20% off your entire bill.`
      : `We noticed it has been a little while! Drop by ${shopName} this week and take 20% off your entire bill with your exclusive comeback voucher.`;
  }

  // If a custom message was provided by the operator, use it
  if (customMessage && customMessage.trim()) {
    bodyCopy = customMessage
      .replace(/\{first_name\}/g, firstName)
      .replace(/\{discount\}/g, discountCode)
      .replace(/\{valid_till\}/g, validity)
      .replace(/\{shop_name\}/g, shopName);
  }

  // Plain text fallback
  plainText = `${subject}\n\nHi ${firstName},\n\n${bodyCopy}\n\nVoucher Code: ${discountCode}\nValidity: ${validity}\n\nSimply present this code at the counter during your next visit.\n\nWarmly,\nTeam ${shopName}\n\n---\nPrivacy & Consent: You received this email because you opted in to receive promotional updates from ${shopName}. Manage or withdraw your communication preferences at: ${consentPortalUrl}`;

  // Rich HTML template
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; color: #1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8F9FA; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="560px" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); padding: 36px 30px; text-align: center;">
              <span style="display: inline-block; background: rgba(255, 255, 255, 0.15); color: #F3F4F6; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
                ${escapeHtml(shopName)}
              </span>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${escapeHtml(headline)}
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hello <strong>${escapeHtml(firstName)}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4B5563;">
                ${escapeHtml(bodyCopy)}
              </p>

              <!-- Coupon Voucher Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #F0FDF4; border: 2px dashed #16A34A; border-radius: 14px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #15803D; font-weight: 600; margin-bottom: 6px;">
                      Your Exclusive Voucher Code
                    </span>
                    <span style="display: inline-block; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #166534; background: #FFFFFF; padding: 8px 24px; border-radius: 8px; border: 1px solid #BBF7D0; font-family: monospace;">
                      ${escapeHtml(discountCode)}
                    </span>
                    <span style="display: block; font-size: 13px; color: #15803D; margin-top: 10px; font-weight: 500;">
                      ⏰ ${escapeHtml(validity)} • Show at counter to redeem
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280; line-height: 1.5;">
                We look forward to serving you soon!
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1F2937;">
                Warmly,<br>Team ${escapeHtml(shopName)}
              </p>
            </td>
          </tr>

          <!-- Footer & Privacy Compliance -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 30px; border-top: 1px solid #F3F4F6; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
                <strong>Privacy Notice:</strong> You are receiving this offer because you consented to email notifications at ${escapeHtml(shopName)}.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
                To update your preferences or withdraw consent under DPDP/GDPR: 
                <a href="${consentPortalUrl}" style="color: #4F46E5; text-decoration: underline;">Manage Privacy Preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to: customer.email,
    subject,
    text: plainText,
    html,
  });
}

/**
 * Sends a secure, branded password-reset email with a 6-digit OTP verification code.
 */
export async function sendPasswordResetOtpEmail(
  to: string,
  name: string,
  otp: string,
  expiresInMinutes = 5
): Promise<EmailSendResult> {
  const subject = `Your Nova Insights Verification Code: ${otp}`;
  const displayName = name && name.trim() ? name.trim() : 'Retailer';

  const plainText = `
Hello ${displayName},

We received a request to reset your Nova Insights account password.

Your 6-digit password reset verification code is:

${otp}

This verification code expires in ${expiresInMinutes} minutes and can only be used once.

Enter this code in the verification modal on Nova Insights to continue resetting your password.

If you did not request a password reset, please ignore this email. Your password will remain unchanged and your account is completely secure.

— The Nova Insights Security Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Nova Insights Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0B0B0C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F6F7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(0, 0, 0, 0.08); overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #F1F1F2;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 12px;">
                <tr>
                  <td style="width: 44px; height: 44px; background: #0B0B0C; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: #FFFFFF; font-size: 20px; font-weight: bold; line-height: 44px;">✦</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #0B0B0C; letter-spacing: -0.02em;">
                Nova Insights
              </h1>
              <p style="margin: 0; font-size: 12px; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
                Identity Verification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0B0B0C;">
                Verify your email address
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #3A3A3D;">
                Hello <strong>${escapeHtml(displayName)}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #3A3A3D;">
                We received a request to reset your Nova Insights password. Use the following 6-digit verification code to confirm your request:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px; width: 100%;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #F4F6FB; border: 2px dashed #2F6BFF; border-radius: 16px; padding: 18px 36px; text-align: center;">
                      <span style="font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #2F6BFF; line-height: 1;">
                        ${escapeHtml(otp)}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Callout -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9F9FA; border-radius: 14px; border: 1px solid rgba(0, 0, 0, 0.05); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 12px; color: #6E6E73; line-height: 1.5;">
                      ⏱ <strong>Time-sensitive code:</strong> This code is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once. Never share this code with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 13px; color: #6E6E73; line-height: 1.5;">
                Enter this code in the password reset window to proceed to creating your new password.
              </p>

              <hr style="border: none; border-top: 1px solid #F1F1F2; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; color: #9A9A9E; line-height: 1.5;">
                <strong>Didn't request this code?</strong> You can safely ignore this email. Your current password remains active and no changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9F9FA; padding: 20px 32px; border-top: 1px solid #F1F1F2; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9A9A9E; line-height: 1.5;">
                Nova Insights &bull; Privacy-First Customer Intelligence Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to,
    subject,
    text: plainText,
    html,
  });
}

/**
 * Sends a secure, branded password-reset email with a single-use verification link.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
  expiresInMinutes = 15
): Promise<EmailSendResult> {
  const subject = 'Reset Your Nova Insights Password';
  const displayName = name && name.trim() ? name.trim() : 'Retailer';

  const plainText = `
Hello ${displayName},

We received a request to reset the password for your Nova Insights account.

Use the link below to set a new password:
${resetUrl}

This single-use link will expire in ${expiresInMinutes} minutes.

If you did not request this password reset, please ignore this email. Your password will remain unchanged and your account is secure.

— The Nova Insights Security Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Nova Insights Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0B0B0C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F6F7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(0, 0, 0, 0.08); overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #F1F1F2;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 12px;">
                <tr>
                  <td style="width: 44px; height: 44px; background: #0B0B0C; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: #FFFFFF; font-size: 20px; font-weight: bold; line-height: 44px;">✦</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #0B0B0C; letter-spacing: -0.02em;">
                Nova Insights
              </h1>
              <p style="margin: 0; font-size: 12px; color: #6E6E73; text-transform: uppercase; tracking-wider; font-weight: 600;">
                Security Verification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0B0B0C;">
                Reset your password
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #3A3A3D;">
                Hello <strong>${escapeHtml(displayName)}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #3A3A3D;">
                We received a request to reset your Nova Insights password. Click the button below to choose a new password for your retailer account:
              </p>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 28px; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #2F6BFF; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(47, 107, 255, 0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Callout -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9F9FA; border-radius: 14px; border: 1px solid rgba(0, 0, 0, 0.05); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 12px; color: #6E6E73; line-height: 1.5;">
                      ⏱ <strong>Time-sensitive link:</strong> This single-use link expires in <strong>${expiresInMinutes} minutes</strong>. After that, you will need to request a new link.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 12px; color: #6E6E73; line-height: 1.5;">
                If you're having trouble with the button, copy and paste this URL into your web browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 11px; color: #2F6BFF; word-break: break-all; line-height: 1.4;">
                <a href="${resetUrl}" style="color: #2F6BFF; text-decoration: underline;">${resetUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #F1F1F2; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; color: #9A9A9E; line-height: 1.5;">
                <strong>Didn't request this?</strong> You can safely ignore this email. Your current password will not change and no one can access your account without this link.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9F9FA; padding: 20px 32px; border-top: 1px solid #F1F1F2; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9A9A9E; line-height: 1.5;">
                Nova Insights &bull; Privacy-First Customer Intelligence Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to,
    subject,
    text: plainText,
    html,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Masks an email for safe logging (e.g. j***n@example.com).
 */
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
