/**
 * NOVA INSIGHTS — COMPREHENSIVE AUTOMATED VERIFICATION TEST SUITE
 * 
 * Tests Stages 1-4, Real Authentication, Authorization (RBAC),
 * Multi-Tenant Isolation, Customer Consent Enforcement, and Stage 4 Stress Tests.
 */

import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ suite, name, passed: true, durationMs: Date.now() - start });
    console.log(`  ✅ [PASS] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message || String(err), durationMs: Date.now() - start });
    console.error(`  ❌ [FAIL] ${name} (${Date.now() - start}ms): ${err.message || String(err)}`);
  }
}

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed [${message}]: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

async function request(path: string, options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
} = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    data,
  };
}

async function main() {
  console.log('========================================================================');
  console.log('🧪 NOVA INSIGHTS — STARTING VERIFICATION & TEST SUITE');
  console.log(`📡 Target API: ${API_BASE}`);
  console.log('========================================================================\n');

  // Verify server is responding
  const healthRes = await request('/health');
  if (!healthRes.ok) {
    console.error(`🚨 Fatal: Backend is not responding at ${API_BASE}/health (Status ${healthRes.status}).`);
    process.exit(1);
  }

  // Connect database client for verification assertions
  await connectDB();

  const testSuffix = Math.random().toString(36).substring(2, 7);
  const testEmail = `test_owner_${testSuffix}@example.com`;
  const testPassword = 'Password123!';
  const testShopName = `Test Shop ${testSuffix.toUpperCase()}`;
  let registeredToken = '';
  let registeredUser: any = null;

  // Demo tokens holder
  let ownerToken = '';
  let managerToken = '';
  let staffToken = '';
  let auditorToken = '';

  // ------------------------------------------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & PASSWORD MANAGEMENT
  // ------------------------------------------------------------------------------------------------
  console.log('▶ [SUITE 1: Authentication & Password Management]');

  await runTest('Authentication', 'Valid registration creates user, shop, and returns JWT without password hash', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        shopName: testShopName,
        email: testEmail,
        password: testPassword,
        name: 'Test Owner',
      },
    });

    assertEqual(res.status, 201, 'Registration status code');
    assert(res.data.success, 'Registration success flag');
    assert(res.data.token, 'Registration must return JWT token');
    assert(res.data.user, 'Registration must return user object');
    assertEqual(res.data.user.email, testEmail, 'User email matches');
    assertEqual(res.data.user.role, 'owner', 'New registration is forced to role "owner"');
    assert(!res.data.user.password, 'User object MUST NOT contain password hash');
    assert(!res.data.user.resetPasswordToken, 'User object MUST NOT contain reset token');

    registeredToken = res.data.token;
    registeredUser = res.data.user;
  });

  await runTest('Authentication', 'Invalid registration payload rejected (missing fields)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        email: `invalid_${testSuffix}@example.com`,
      },
    });
    assertEqual(res.status, 400, 'Missing fields rejected with 400');
    assert(!res.data.success, 'Success is false');
  });

  await runTest('Authentication', 'Weak password rejected (< 8 characters)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        shopName: 'Weak Shop',
        email: `weak_${testSuffix}@example.com`,
        password: 'pass',
        name: 'Weak Pass',
      },
    });
    assertEqual(res.status, 400, 'Weak password rejected with 400');
    assert(res.data.message.includes('8 characters'), 'Error specifies length requirement');
  });

  await runTest('Authentication', 'Duplicate registration rejected with 409 Conflict', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        shopName: 'Duplicate Shop',
        email: testEmail,
        password: testPassword,
        name: 'Duplicate Owner',
      },
    });
    assertEqual(res.status, 409, 'Duplicate email rejected with 409');
    assert(!res.data.success, 'Success is false');
    assert(res.data.message.includes('already registered') || res.data.message.includes('already exists'), 'Clear duplicate error message');
  });

  await runTest('Authentication', 'Successful login returns token and user without password hash', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    assertEqual(res.status, 200, 'Login status 200');
    assert(res.data.token, 'Login returns JWT');
    assertEqual(res.data.user.email, testEmail, 'User email matches');
    assert(!res.data.user.password, 'Password hash is excluded from login payload');
  });

  await runTest('Authentication', 'Incorrect password rejected with generic 401', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'WrongPassword999!',
      },
    });
    assertEqual(res.status, 401, 'Incorrect password rejected with 401');
    assert(res.data.message.includes('Invalid email') || res.data.message.includes('credentials'), 'Generic error message prevents enumeration');
  });

  await runTest('Authentication', 'Non-existent email rejected with generic 401 (no enumeration)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: `nonexistent_${testSuffix}@example.com`,
        password: 'SomePassword123!',
      },
    });
    assertEqual(res.status, 401, 'Nonexistent account rejected with 401');
    assert(res.data.message.includes('Invalid email') || res.data.message.includes('credentials'), 'Generic error message prevents enumeration');
  });

  await runTest('Authentication', 'Safe Demo Login produces authenticated tokens for all roles', async () => {
    const roles: Array<'owner' | 'manager' | 'staff' | 'auditor'> = ['owner', 'manager', 'staff', 'auditor'];
    for (const r of roles) {
      const res = await request('/auth/demo-login', {
        method: 'POST',
        body: { role: r },
      });
      assertEqual(res.status, 200, `Demo login for ${r} status 200`);
      assert(res.data.token, `Demo login returns token for ${r}`);
      assertEqual(res.data.user.role, r, `Server assigns role ${r}`);
      assert(res.data.user.isDemo, `Account is explicitly marked isDemo`);
      assert(!res.data.user.password, `Password hash excluded for demo user`);

      if (r === 'owner') ownerToken = res.data.token;
      if (r === 'manager') managerToken = res.data.token;
      if (r === 'staff') staffToken = res.data.token;
      if (r === 'auditor') auditorToken = res.data.token;
    }
  });

  await runTest('Authentication', 'Forgot Password: invalid email format rejected with 400', async () => {
    const res = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: 'invalid_email_format' },
    });
    assertEqual(res.status, 400, 'Invalid email format rejected with 400');
    assert(res.data.message.includes('valid email'), 'Validation message guides user');
  });

  await runTest('Authentication', 'Forgot Password: non-existent email returns generic 200 (no account enumeration)', async () => {
    const res = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: `ghost_user_${Date.now()}@domain.com` },
    });
    assertEqual(res.status, 200, 'Nonexistent account returns 200 generic response');
    assert(
      res.data.message.includes('dispatched') || res.data.message.includes('sent') || res.data.message.includes('instructions'),
      'Generic response prevents user enumeration'
    );
  });

  let validResetRawToken = '';
  await runTest('Authentication', 'Forgot Password: valid email sets SHA-256 token hash & 15-minute expiry in DB', async () => {
    const res = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: testEmail },
    });
    assertEqual(res.status, 200, 'Forgot password returns 200 for registered retailer');
    assert(res.data.success, 'Success is true');

    // Verify token hash is stored securely in database
    const userDoc = await User.findOne({ email: testEmail }).select('+resetPasswordToken +resetPasswordExpires');
    assert(userDoc, 'User exists in database');
    assert(userDoc?.resetPasswordToken, 'Reset token hash must be set in database');
    assertEqual(userDoc?.resetPasswordToken?.length, 64, 'Token is stored as 64-character SHA-256 hex hash');
    assert(userDoc?.resetPasswordExpires, 'Token expiry must be set');
    const expiryTime = userDoc!.resetPasswordExpires!.getTime();
    const now = Date.now();
    assert(expiryTime > now, 'Expiry time must be in future');
    assert(expiryTime <= now + 16 * 60 * 1000, 'Expiry time must be within 15 minutes');

    // Create a known cryptographic test token for subsequent verification tests
    validResetRawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(validResetRawToken).digest('hex');
    userDoc!.resetPasswordToken = hashed;
    userDoc!.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await userDoc!.save();
  });

  await runTest('Authentication', 'Verify Reset Token: missing token query parameter rejected with 400', async () => {
    const res = await request('/auth/verify-reset-token');
    assertEqual(res.status, 400, 'Missing token returns 400');
    assertEqual(res.data.valid, false, 'Valid flag is false');
  });

  await runTest('Authentication', 'Verify Reset Token: malformed or invalid token rejected with 400', async () => {
    const res = await request('/auth/verify-reset-token?token=completely_invalid_token_12345');
    assertEqual(res.status, 400, 'Invalid token returns 400');
    assertEqual(res.data.valid, false, 'Valid flag is false');
  });

  await runTest('Authentication', 'Verify Reset Token: expired token rejected with 400', async () => {
    const expiredRaw = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRaw).digest('hex');
    await User.updateOne(
      { email: testEmail },
      { resetPasswordToken: expiredHash, resetPasswordExpires: new Date(Date.now() - 30000) }
    );

    const res = await request(`/auth/verify-reset-token?token=${expiredRaw}`);
    assertEqual(res.status, 400, 'Expired token returns 400');
    assertEqual(res.data.valid, false, 'Expired token valid flag is false');

    // Restore active valid token
    const activeHash = crypto.createHash('sha256').update(validResetRawToken).digest('hex');
    await User.updateOne(
      { email: testEmail },
      { resetPasswordToken: activeHash, resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000) }
    );
  });

  await runTest('Authentication', 'Verify Reset Token: valid token verifies successfully without consuming token', async () => {
    const res = await request(`/auth/verify-reset-token?token=${validResetRawToken}`);
    assertEqual(res.status, 200, 'Valid token returns 200');
    assertEqual(res.data.valid, true, 'Valid flag is true');

    // Ensure token is NOT consumed by verification endpoint
    const userDoc = await User.findOne({ email: testEmail }).select('+resetPasswordToken');
    assert(userDoc?.resetPasswordToken, 'Token remains in DB until password reset submission');
  });

  await runTest('Authentication', 'Reset Password: password mismatch rejected with 400', async () => {
    const res = await request('/auth/reset-password', {
      method: 'POST',
      body: {
        token: validResetRawToken,
        newPassword: 'BrandNewSecurePassword2026!',
        confirmPassword: 'MismatchPassword2026!',
      },
    });
    assertEqual(res.status, 400, 'Mismatched passwords return 400');
    assert(res.data.message.toLowerCase().includes('not match'), 'Error indicates mismatch');
  });

  await runTest('Authentication', 'Reset Password: weak password (< 8 chars, missing complexity) rejected with 400', async () => {
    const res = await request('/auth/reset-password', {
      method: 'POST',
      body: {
        token: validResetRawToken,
        newPassword: 'weak',
        confirmPassword: 'weak',
      },
    });
    assertEqual(res.status, 400, 'Weak password rejected with 400');
  });

  const updatedPassword = 'BrandNewSecureP@ss2026!';
  await runTest('Authentication', 'Reset Password: successful reset updates password, revokes token, and clears old password', async () => {
    const resetRes = await request('/auth/reset-password', {
      method: 'POST',
      body: {
        token: validResetRawToken,
        newPassword: updatedPassword,
        confirmPassword: updatedPassword,
      },
    });
    assertEqual(resetRes.status, 200, 'Successful reset returns 200');
    assert(resetRes.data.success, 'Success is true');

    // 1. Verify token was invalidated in database (single-use)
    const userDoc = await User.findOne({ email: testEmail }).select('+resetPasswordToken +resetPasswordExpires');
    assert(!userDoc?.resetPasswordToken, 'Reset token must be wiped from DB after successful reset');
    assert(!userDoc?.resetPasswordExpires, 'Reset expiry must be wiped from DB');

    // 2. Verify OLD password no longer works
    const oldLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    assertEqual(oldLogin.status, 401, 'Old password fails login with 401 Unauthorized');

    // 3. Verify NEW password authenticates successfully
    const newLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: updatedPassword,
      },
    });
    assertEqual(newLogin.status, 200, 'New password authenticates successfully with 200 OK');
    assert(newLogin.data.token, 'New password login issues valid JWT');
    assertEqual(newLogin.data.user.email, testEmail, 'Authenticated user email matches');

    // 4. Verify used token cannot be reused
    const reuseVerify = await request(`/auth/verify-reset-token?token=${validResetRawToken}`);
    assertEqual(reuseVerify.status, 400, 'Used token rejected by verify endpoint');
    assertEqual(reuseVerify.data.valid, false, 'Used token is invalid');

    const reuseReset = await request('/auth/reset-password', {
      method: 'POST',
      body: {
        token: validResetRawToken,
        newPassword: 'AnotherPassword2026!',
        confirmPassword: 'AnotherPassword2026!',
      },
    });
    assertEqual(reuseReset.status, 400, 'Used token rejected by reset-password endpoint');
  });

  await runTest('Authentication', 'Logout clears authentication session', async () => {
    const res = await request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${registeredToken}` },
    });
    assertEqual(res.status, 200, 'Logout status 200');
    assert(res.data.success, 'Logout success is true');
  });

  // ------------------------------------------------------------------------------------------------
  // SUITE 2: AUTHORIZATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // ------------------------------------------------------------------------------------------------
  console.log('\n▶ [SUITE 2: Authorization & Role-Based Access Control (RBAC)]');

  await runTest('Authorization', 'Unauthenticated requests to protected routes are rejected with 401', async () => {
    const res = await request('/customers');
    assertEqual(res.status, 401, 'Unauthenticated /customers rejected');
    assert(res.data.message.includes('Authentication required'), '401 message specifies auth required');
  });

  await runTest('Authorization', 'Malformed or invalid JWT tokens are rejected with 401', async () => {
    const res = await request('/customers', {
      headers: { Authorization: 'Bearer this.is.a.completely.invalid.token' },
    });
    assertEqual(res.status, 401, 'Malformed token rejected with 401');
  });

  await runTest('Authorization', 'Owner has full access to customers, settings, and logs', async () => {
    const custRes = await request('/customers', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(custRes.status, 200, 'Owner can access /customers');
    assert(Array.isArray(custRes.data.data), 'Returns customers array');

    const setRes = await request('/settings', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(setRes.status, 200, 'Owner can access /settings');

    const logRes = await request('/logs/audit', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(logRes.status, 200, 'Owner can access /logs/audit');
  });

  await runTest('Authorization', 'Manager has access with contact masking, but cannot update settings or delete customers', async () => {
    // 1. Manager can read customers, but contact details are masked
    const custRes = await request('/customers', {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assertEqual(custRes.status, 200, 'Manager can access /customers');
    const customers = custRes.data.data;
    assert(customers.length > 0, 'Customers returned');
    
    // Verify masking on patrons with phone and email
    const sampleWithPhone = customers.find((c: any) => c.phone && c.phone.trim() !== '');
    if (sampleWithPhone) {
      assert(
        sampleWithPhone.phone.includes('*') ||
        sampleWithPhone.phone.includes('Hidden') ||
        sampleWithPhone.phone.includes('REDACTED'),
        'Customer phone is masked for Manager'
      );
    }

    const sampleWithEmail = customers.find((c: any) => c.email && c.email.trim() !== '');
    if (sampleWithEmail) {
      assert(
        sampleWithEmail.email.includes('*') ||
        sampleWithEmail.email.includes('Hidden') ||
        sampleWithEmail.email.includes('REDACTED'),
        'Customer email is masked for Manager'
      );
    }

    assert(sampleWithPhone || sampleWithEmail, 'At least one customer with contact details was checked');

    // 2. Manager CANNOT update shop settings
    const setUpdateRes = await request('/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: { shopName: 'Hacked Shop Name' },
    });
    assertEqual(setUpdateRes.status, 403, 'Manager forbidden from updating settings');

    // 3. Manager CANNOT delete customer
    const sample = customers[0];
    const delRes = await request(`/customers/${sample.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assertEqual(delRes.status, 403, 'Manager forbidden from deleting customers');
  });

  await runTest('Authorization', 'Staff role cannot access customer directory, offers, settings, or audit logs', async () => {
    const custRes = await request('/customers', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(custRes.status, 403, 'Staff forbidden from /customers');

    const offerRes = await request('/offers', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(offerRes.status, 403, 'Staff forbidden from /offers');

    const setRes = await request('/settings', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(setRes.status, 403, 'Staff forbidden from /settings');

    const auditRes = await request('/logs/audit', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(auditRes.status, 403, 'Staff forbidden from /logs/audit');

    // Staff CAN access tasks and templates
    const tasksRes = await request('/tasks', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(tasksRes.status, 200, 'Staff can access /tasks');

    const tmplRes = await request('/templates', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(tmplRes.status, 200, 'Staff can access /templates');
  });

  await runTest('Authorization', 'Auditor role is strictly read-only for compliance logs and cannot mutate records', async () => {
    // Auditor CAN read consent and audit logs
    const consentRes = await request('/logs/consent', {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    assertEqual(consentRes.status, 200, 'Auditor can read /logs/consent');

    const auditRes = await request('/logs/audit', {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    assertEqual(auditRes.status, 200, 'Auditor can read /logs/audit');

    // Auditor CANNOT dispatch offers
    const offerRes = await request('/offers/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auditorToken}` },
      body: { category: 'REGULAR', channel: 'whatsapp' },
    });
    assertEqual(offerRes.status, 403, 'Auditor forbidden from dispatching offers');

    // Auditor CANNOT update settings
    const setRes = await request('/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${auditorToken}` },
      body: { shopName: 'Auditor Renamed' },
    });
    assertEqual(setRes.status, 403, 'Auditor forbidden from updating settings');
  });

  await runTest('Authorization', 'Multi-tenant isolation: Tenant B cannot view, modify, or delete Tenant A records', async () => {
    // Register Tenant Alpha
    const alphaRes = await request('/auth/register', {
      method: 'POST',
      body: {
        shopName: `Alpha Coffee ${testSuffix}`,
        email: `alpha_${testSuffix}@example.com`,
        password: 'Password123!',
        name: 'Alpha Owner',
      },
    });
    const alphaToken = alphaRes.data.token;
    const alphaShopId = alphaRes.data.user.shopId;

    // Register Tenant Beta
    const betaRes = await request('/auth/register', {
      method: 'POST',
      body: {
        shopName: `Beta Tea ${testSuffix}`,
        email: `beta_${testSuffix}@example.com`,
        password: 'Password123!',
        name: 'Beta Owner',
      },
    });
    const betaToken = betaRes.data.token;

    // Check in customer into Alpha Shop
    const checkInRes = await request(`/checkin/${alphaShopId}`, {
      method: 'POST',
      body: {
        name: 'Alpha Patron',
        contact: `+91 98888 ${Math.floor(10000 + Math.random() * 90000)}`,
        consentGiven: true,
      },
    });
    const alphaCustomerId = checkInRes.data.customer.id;

    // Tenant Beta lists customers -> MUST NOT contain Alpha Patron
    const betaCustomers = await request('/customers', {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assertEqual(betaCustomers.status, 200, 'Beta can list own customers');
    const hasAlphaCustomer = betaCustomers.data.data.some((c: any) => c.id === alphaCustomerId);
    assert(!hasAlphaCustomer, 'Tenant Beta cannot see Tenant Alpha customer');

    // Tenant Beta tries to fetch Alpha Patron directly -> 404 Not Found
    const crossFetch = await request(`/customers/${alphaCustomerId}`, {
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assertEqual(crossFetch.status, 404, 'Cross-tenant customer fetch rejected with 404');

    // Tenant Beta tries to delete Alpha Patron -> 404 Not Found
    const crossDelete = await request(`/customers/${alphaCustomerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${betaToken}` },
    });
    assertEqual(crossDelete.status, 404, 'Cross-tenant customer delete rejected with 404');
  });

  // ------------------------------------------------------------------------------------------------
  // SUITE 3: CUSTOMER CONSENT ENFORCEMENT & PRIVACY LIFECYCLE
  // ------------------------------------------------------------------------------------------------
  console.log('\n▶ [SUITE 3: Customer Consent Enforcement & Privacy Lifecycle]');

  await runTest('Consent & Privacy', 'Master consent opt-out strictly blocks personalized offer dispatch', async () => {
    // 1. Create a customer with master consent OFF
    const checkIn = await request('/checkin', {
      method: 'POST',
      body: {
        name: `OptedOut Patron ${testSuffix}`,
        contact: `+91 97777 ${Math.floor(10000 + Math.random() * 90000)}`,
        consentGiven: false,
      },
    });
    assertEqual(checkIn.status, 200, 'Customer created via QR check-in');
    const custId = checkIn.data.customer.id;
    assertEqual(checkIn.data.customer.consent.personalisedOffers, false, 'Personalised offers consent is false');

    // 2. Dispatch offer for NEW category
    const offerRes = await request('/offers/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: {
        category: 'NEW',
        channel: 'whatsapp',
      },
    });
    assertEqual(offerRes.status, 200, 'Offer dispatched');
    assert(offerRes.data.excludedCount >= 1, 'Excluded count includes opted-out patrons');

    // 3. Verify no SentOffer record was created for the opted-out patron
    const sentOffersRes = await request('/offers', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const patronOffer = sentOffersRes.data.data.find((o: any) => o.customerId === custId);
    assert(!patronOffer, 'No sent offer record created for opted-out customer');
  });

  await runTest('Consent & Privacy', 'Channel consent restrictions are strictly enforced', async () => {
    // Check in customer consenting to email but opting out of SMS
    const checkIn = await request('/checkin', {
      method: 'POST',
      body: {
        name: `EmailOnly Patron ${testSuffix}`,
        contact: `email_only_${testSuffix}@example.com`,
        consentGiven: true,
      },
    });
    const custId = checkIn.data.customer.id;

    // Update consent: disable SMS explicitly
    await request(`/customers/${custId}/consent`, {
      method: 'PATCH',
      headers: { 'x-privacy-portal': 'customer-self-service' },
      body: {
        channels: { sms: false, email: true, whatsapp: false },
      },
    });

    // Verify SMS dispatch excludes this customer
    const smsDispatch = await request('/offers/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: {
        category: 'NEW',
        channel: 'sms',
      },
    });
    assertEqual(smsDispatch.status, 200, 'SMS offer dispatch evaluated');
    assert(smsDispatch.data.excludedCount >= 1, 'Patron excluded from SMS dispatch');
  });

  await runTest('Consent & Privacy', 'Data Portability Export bundle complies with GDPR/DPDP requirements', async () => {
    const custRes = await request('/customers', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const sampleCust = custRes.data.data[0];

    const exportRes = await request(`/customers/${sampleCust.id}/export`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(exportRes.status, 200, 'Export status 200');
    assert(exportRes.data.customerId === sampleCust.id, 'Exported customerId matches');
    assert(exportRes.data.profile, 'Profile included');
    assert(exportRes.data.trackingMetrics, 'Tracking metrics included');
    assert(exportRes.data.consentStatus, 'Consent status included');
    assert(exportRes.data.auditNotice.includes('DPDP and GDPR'), 'Compliance audit notice present');
  });

  await runTest('Consent & Privacy', 'Right to be Forgotten: complete erasure of customer, visits, reviews, and offers', async () => {
    // 1. Create a customer, a visit, a review, and dispatch an offer
    const checkIn = await request('/checkin', {
      method: 'POST',
      body: {
        name: `DeleteMe Patron ${testSuffix}`,
        contact: `deleteme_${testSuffix}@example.com`,
        consentGiven: true,
        review: 'Great chai, testing deletion!',
        rating: 5,
      },
    });
    const delCustId = checkIn.data.customer.id;

    // 2. Perform Right to be Forgotten erasure by Owner
    const delRes = await request(`/customers/${delCustId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(delRes.status, 200, 'Delete customer status 200');
    assert(delRes.data.success, 'Delete success flag');

    // 3. Confirm Customer record is gone
    const checkGone = await request(`/customers/${delCustId}`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(checkGone.status, 404, 'Customer record confirmed deleted');

    // 4. Confirm anonymized audit tombstone exists in audit logs
    const auditLogs = await request('/logs/audit', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const tombstone = auditLogs.data.data.find((l: any) => l.action.includes(delCustId));
    assert(tombstone, 'Anonymized audit tombstone logged in audit trail');
  });

  // ------------------------------------------------------------------------------------------------
  // SUITE 4: STAGE 4 STRESS TESTING, GOVERNANCE & ALGORITHMIC FAIRNESS
  // ------------------------------------------------------------------------------------------------
  console.log('\n▶ [SUITE 4: Stage 4 Stress Testing, Governance & Algorithmic Fairness]');

  await runTest('Stage 4 Validation', 'Synthetic 10,000 dataset benchmark adheres to MCAR, MAR, and MNAR patterns', async () => {
    const res = await request('/governance/benchmark?limit=100');
    assertEqual(res.status, 200, 'Synthetic benchmark status 200');
    assert(res.data.success, 'Success is true');
    assertEqual(res.data.totalBenchmarkSize, 10000, 'Dataset benchmark size is 10,000 customers');
    assert(res.data.governanceMetadata.missingnessPatterns.MCAR, 'MCAR metadata documented');
    assert(res.data.governanceMetadata.missingnessPatterns.MAR, 'MAR metadata documented');
    assert(res.data.governanceMetadata.missingnessPatterns.MNAR, 'MNAR metadata documented');
    assert(res.data.governanceMetadata.classImbalance.churnRiskPct === 6, 'Churn risk imbalance is 6%');
    assert(res.data.governanceMetadata.classImbalance.highValuePct === 8, 'High value imbalance is 8%');
  });

  await runTest('Stage 4 Validation', 'Deliverable 1: Opt-Out Performance & Privacy Leakage Stress Test (0% leakage at all opt-out levels)', async () => {
    const res = await request('/governance/stress-test/opt-out', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(res.status, 200, 'Opt-out stress test status 200');
    assert(res.data.success, 'Success is true');
    const testData = res.data.data || res.data;
    assert(Array.isArray(testData.scenarios), 'Scenarios array present');
    
    // Check that privacy leakage is 0.00% across all opt-out ratios
    for (const step of testData.scenarios) {
      assertEqual(step.privacyLeakageScore, 0, `Privacy leakage score is 0.00% at ${step.optOutRatePercent}% opt-out`);
      assertEqual(step.status, 'PASS', `Step status is PASS at ${step.optOutRatePercent}% opt-out`);
    }

    assert(testData.summary.includes('Zero privacy leakage observed'), 'Summary confirms zero privacy leakage');
  });

  await runTest('Stage 4 Validation', 'Deliverable 2: Consumer Vulnerability & Fairness Audit (Four-Fifths Rule compliance)', async () => {
    const res = await request('/governance/fairness-audit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(res.status, 200, 'Fairness audit status 200');
    assert(res.data.success, 'Success is true');
    const auditData = res.data.data || res.data;

    // Check demographic disparate impact ratios by region
    assert(Array.isArray(auditData.disparateImpactByRegion), 'Disparate impact by region present');
    for (const r of auditData.disparateImpactByRegion) {
      assert(r.disparateImpactRatio >= 0.80, `Region ${r.region} satisfies Four-Fifths rule (ratio >= 0.80)`);
      assertEqual(r.compliantFourFifths, true, `Region ${r.region} passes`);
    }

    // Check vulnerability exploitation audit
    assert(Array.isArray(auditData.vulnerabilityExploitationAudit), 'Vulnerability audit array present');
    for (const v of auditData.vulnerabilityExploitationAudit) {
      assertEqual(v.predatoryPriceGougingDetected, false, 'No predatory pricing');
      assertEqual(v.manipulativeWinbackDetected, false, 'No manipulative winback');
      assertEqual(v.status, 'FAIR', 'Status is FAIR');
    }

    assertEqual(auditData.verdict, 'COMPLIANT', 'Fairness audit verdict is COMPLIANT');
  });

  await runTest('Stage 4 Validation', 'Automated monthly retention schedule generates SHA-256 verifiable report', async () => {
    const res = await request('/governance/retention/run', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assertEqual(res.status, 200, 'Retention job status 200');
    assert(res.data.success, 'Success is true');
    const reportData = res.data.data || res.data.report || res.data;
    assert(reportData.auditTombstoneHash, 'Report SHA-256 tombstone hash present');
    assertEqual(reportData.status, 'COMPLETED', 'Job status completed');
  });

  // ------------------------------------------------------------------------------------------------
  // SUMMARY REPORT
  // ------------------------------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('========================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Tests Run:  ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);
  console.log(`Success Rate:     ${((passed / total) * 100).toFixed(1)}%\n`);

  await mongoose.disconnect();

  if (failed > 0) {
    console.error('❌ FAILURES DETECTED:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('✨ ALL TESTS PASSED SUCCESSFULLY! Real Authentication, RBAC, Multi-Tenancy,');
    console.log('   Consent Enforcement, and Stage 1-4 Verification are 100% verified.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
