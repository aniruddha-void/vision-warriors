import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { SettingsModel } from '../models/LogsAndSettings.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendEmail, sendPasswordResetEmail, sendPasswordResetOtpEmail } from '../services/emailService.js';
import { UserRole } from '../types/index.js';
import { config } from '../config/env.js';

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

/**
 * Password strength policy:
 * At least 8 characters, at least 1 uppercase, 1 lowercase, 1 number
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export function validateEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function setAuthCookie(res: Response, token: string): void {
  res.cookie('nova_auth_token', token, {
    httpOnly: true,
    secure: config.IS_PRODUCTION,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Register a new retailer shop account and owner.
 * Role is strictly locked to 'owner' to prevent unauthorized role escalation.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, shopName } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedShopName = (shopName || `${trimmedName}'s Shop`).trim();

    if (!validateEmailFormat(trimmedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format',
      });
      return;
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      res.status(400).json({
        success: false,
        message: passwordCheck.reason,
      });
      return;
    }

    // Race-safe check for existing email
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered',
      });
      return;
    }

    // Generate isolated shop ID slug
    const shopSlug = trimmedShopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'shop';
    const uniqueSuffix = crypto.randomBytes(3).toString('hex');
    const shopId = `${shopSlug}-${uniqueSuffix}`;

    // Initialize the Shop Settings for this tenant
    await SettingsModel.create({
      shopId,
      shopName: trimmedShopName,
      dataMinimization: true,
      retentionPeriodMonths: 6,
      defaultChannel: 'whatsapp',
      privacyMode: true,
      demoMode: false,
      demoCustomerId: '',
      categoryThresholds: {
        newMaxVisits: 2,
        regularMinVisits30Days: 3,
        regularMaxLastVisitDays: 14,
        irregularMinLastVisitDays: 21,
        attentionMinDays: 14,
        attentionMaxDays: 21,
      },
    });

    // Create the Owner user account (strictly owner role)
    const user = new User({
      email: trimmedEmail,
      password,
      name: trimmedName,
      role: 'owner',
      shopId,
      isDemo: false,
    });

    await user.save();

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId,
      isDemo: false,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId,
        shopName: trimmedShopName,
      },
    });
  } catch (error: any) {
    console.error('[Register Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
}

/**
 * Sign in with registered credentials.
 * Rejects invalid credentials without revealing whether email exists.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    // Consistent timing rejection
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or credentials' });
      return;
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId || 'chai-and-co',
      isDemo: Boolean(user.isDemo),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    setAuthCookie(res, token);

    // Retrieve shop name if exists
    const settings = await SettingsModel.findOne({ shopId: user.shopId || 'chai-and-co' });
    const shopName = settings?.shopName || 'Chai & Co';

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId || 'chai-and-co',
        shopName,
        isDemo: Boolean(user.isDemo),
      },
    });
  } catch (error: any) {
    console.error('[Login Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during sign in' });
  }
}

/**
 * Seeded Demo accounts configuration for safe presentation and development.
 */
const DEMO_ACCOUNTS: Record<
  'owner' | 'manager' | 'staff' | 'auditor',
  { email: string; name: string; role: UserRole; defaultPass: string }
> = {
  owner: {
    email: 'amanda@chaiandco.com',
    name: 'Amanda (Owner)',
    role: 'owner',
    defaultPass: 'DemoOwner2026!',
  },
  manager: {
    email: 'karan@chaiandco.com',
    name: 'Karan (Manager)',
    role: 'manager',
    defaultPass: 'DemoManager2026!',
  },
  staff: {
    email: 'rahul@chaiandco.com',
    name: 'Rahul (Staff)',
    role: 'staff',
    defaultPass: 'DemoStaff2026!',
  },
  auditor: {
    email: 'priya@chaiandco.com',
    name: 'Priya (Auditor)',
    role: 'auditor',
    defaultPass: 'DemoAuditor2026!',
  },
};

/**
 * Safe Demo Authentication Flow.
 * Validates role, authenticates against a genuine demo account stored in MongoDB,
 * and signs a verified JWT with the exact backend role and shopId.
 */
export async function demoLogin(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.body;
    const validRoles: ('owner' | 'manager' | 'staff' | 'auditor')[] = ['owner', 'manager', 'staff', 'auditor'];

    if (!role || !validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: `Invalid demo role. Allowed roles: ${validRoles.join(', ')}`,
      });
      return;
    }

    const config = DEMO_ACCOUNTS[role as keyof typeof DEMO_ACCOUNTS];
    let demoUser = await User.findOne({ email: config.email });

    if (!demoUser) {
      // Create the demo user if not already present
      demoUser = new User({
        email: config.email,
        password: config.defaultPass,
        name: config.name,
        role: config.role,
        shopId: 'chai-and-co',
        isDemo: true,
      });
      await demoUser.save();
    } else if (demoUser.role !== config.role) {
      demoUser.role = config.role;
      demoUser.isDemo = true;
      demoUser.shopId = 'chai-and-co';
      await demoUser.save();
    }

    const tokenPayload = {
      id: demoUser._id.toString(),
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      shopId: 'chai-and-co',
      isDemo: true,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: demoUser._id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        shopId: 'chai-and-co',
        shopName: 'Chai & Co',
        isDemo: true,
      },
    });
  } catch (error: any) {
    console.error('[DemoLogin Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during demo authentication' });
  }
}

/**
 * Forgot Password Flow:
 * Generates cryptographically secure 6-digit OTP,
 * hashes the OTP with SHA-256 for database storage with 5-minute expiry,
 * and delivers the OTP email via Nodemailer Gmail SMTP.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || !validateEmailFormat(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    // Generic response regardless of whether account exists to prevent email enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists with that email address, a 6-digit verification code has been sent.',
    };

    if (!user) {
      res.json(genericResponse);
      return;
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');

    // 5 minutes expiry and reset attempt count
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    // Dispatch branded OTP email via Nodemailer
    try {
      await sendPasswordResetOtpEmail(user.email, user.name, rawOtp, 5);
    } catch (emailErr: any) {
      console.error('[ForgotPassword Email Error]:', emailErr?.message || emailErr);
    }

    res.json(genericResponse);
  } catch (error: any) {
    console.error('[ForgotPassword Error]:', error);
    res.status(500).json({ success: false, message: 'Server error processing password reset request' });
  }
}

/**
 * Resend Reset OTP:
 * Generates a fresh 6-digit OTP, updates expiration, and sends a new verification email.
 */
export async function resendResetOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || !validateEmailFormat(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    const genericResponse = {
      success: true,
      message: 'If an account exists with that email address, a new 6-digit verification code has been sent.',
    };

    if (!user) {
      res.json(genericResponse);
      return;
    }

    // Generate fresh 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    try {
      await sendPasswordResetOtpEmail(user.email, user.name, rawOtp, 5);
    } catch (emailErr: any) {
      console.error('[ResendOtp Email Error]:', emailErr?.message || emailErr);
    }

    res.json(genericResponse);
  } catch (error: any) {
    console.error('[ResendResetOtp Error]:', error);
    res.status(500).json({ success: false, message: 'Server error resending verification code' });
  }
}

/**
 * Verify Email OTP:
 * Validates the submitted 6-digit OTP, checks expiration, enforces max attempt limit,
 * invalidates the OTP immediately, and issues a cryptographically secure, single-use
 * reset authorization token.
 */
export async function verifyResetOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required' });
      return;
    }

    const cleanedOtp = String(otp).trim();
    if (!/^\d{6}$/.test(cleanedOtp)) {
      res.status(400).json({ success: false, message: 'Invalid code format. Please enter a valid 6-digit code.' });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordOtpAttempts');

    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.',
      });
      return;
    }

    // Check maximum attempts limit (max 5)
    if ((user.resetPasswordOtpAttempts || 0) >= 5) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      await user.save();
      res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new verification code.',
      });
      return;
    }

    // Check expiry
    if (user.resetPasswordOtpExpires < new Date()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      await user.save();
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
      return;
    }

    // Secure timing-safe hash comparison
    const hashedInput = crypto.createHash('sha256').update(cleanedOtp).digest('hex');
    if (hashedInput !== user.resetPasswordOtp) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
      await user.save();
      res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check the 6-digit code and try again.',
      });
      return;
    }

    // OTP verified successfully: Invalidate OTP so it cannot be reused
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtpAttempts = undefined;

    // Issue short-lived, single-use reset authorization token (15 minutes)
    const rawResetAuthToken = crypto.randomBytes(32).toString('hex');
    const hashedResetAuthToken = crypto.createHash('sha256').update(rawResetAuthToken).digest('hex');
    user.resetPasswordToken = hashedResetAuthToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({
      success: true,
      message: 'OTP Verified Successfully',
      resetToken: rawResetAuthToken,
    });
  } catch (error: any) {
    console.error('[VerifyResetOtp Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
}

/**
 * Verify Password Reset Token:
 * Checks whether a single-use authorization token exists in the database and has not expired.
 * Does NOT consume the token (read-only verification).
 */
export async function verifyResetToken(req: Request, res: Response): Promise<void> {
  try {
    const rawToken = (req.query.token as string) || (req.body?.token as string) || (req.body?.resetToken as string);

    if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
      res.status(400).json({
        success: false,
        valid: false,
        message: 'A valid password reset authorization token is required',
      });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        valid: false,
        message: 'Password reset authorization is invalid, expired, or has already been used.',
      });
      return;
    }

    res.json({
      success: true,
      valid: true,
      message: 'Reset authorization is valid and active.',
    });
  } catch (error: any) {
    console.error('[VerifyResetToken Error]:', error);
    res.status(500).json({ success: false, valid: false, message: 'Server error during token verification' });
  }
}

/**
 * Reset Password Flow:
 * Verifies single-use reset authorization token issued upon OTP verification,
 * validates new password strength and matching confirmation,
 * hashes new password securely with bcrypt, and invalidates the token.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, resetToken, newPassword, confirmPassword } = req.body;
    const authToken = (resetToken || token || '').trim();

    if (!authToken || !newPassword) {
      res.status(400).json({ success: false, message: 'Reset authorization and new password are required' });
      return;
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      res.status(400).json({ success: false, message: passwordCheck.reason });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(authToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Password reset authorization is invalid, expired, or has already been used',
      });
      return;
    }

    // Set new password (pre-save hook hashes with bcrypt)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new credentials.',
    });
  } catch (error: any) {
    console.error('[ResetPassword Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
}

/**
 * Logout: clears session cookie.
 */
export function logout(_req: Request, res: Response): void {
  res.clearCookie('nova_auth_token', {
    httpOnly: true,
    secure: config.IS_PRODUCTION,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Signed out successfully' });
}

/**
 * Return current authenticated user details.
 */
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const settings = await SettingsModel.findOne({ shopId: user.shopId });
    const shopName = settings?.shopName || 'Chai & Co';

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId,
        shopName,
        isDemo: Boolean(user.isDemo),
        settings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error retrieving user' });
  }
}
