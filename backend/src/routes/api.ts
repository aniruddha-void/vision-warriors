import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  forgotPassword,
  resendResetOtp,
  verifyResetOtp,
  verifyResetToken,
  resetPassword,
  logout,
  getMe,
} from '../controllers/authController.js';
import { handleCheckIn } from '../controllers/checkInController.js';
import {
  getCustomers,
  getCustomerById,
  updateCustomerConsent,
  deleteCustomerData,
  exportCustomerData,
} from '../controllers/customerController.js';
import {
  sendOffer,
  getSentOffers,
  checkEmailStatus,
  sendTestEmail,
} from '../controllers/offerController.js';
import {
  getTasks,
  toggleTask,
  getActions,
  completeAction,
  getTemplates,
  updateTemplate,
} from '../controllers/taskActionController.js';
import {
  getReviews,
  addReview,
  getConsentLogs,
  getAuditLogs,
  getSettings,
  updateSettings,
  seedDatabase,
} from '../controllers/miscController.js';
import {
  getGovernanceFramework,
  getSyntheticBenchmark,
  handleOptOutStressTest,
  handleFairnessAudit,
  handleRetentionJob,
} from '../controllers/governanceController.js';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.js';
import {
  forgotPasswordLimiter,
  otpResendLimiter,
  verifyOtpLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js';

const router = Router();

// --- 1. Health Check ---
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'Nova Insights Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// --- 2. Authentication Endpoints ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/demo-login', demoLogin);
router.post('/auth/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/auth/resend-reset-otp', otpResendLimiter, resendResetOtp);
router.post('/auth/verify-reset-otp', verifyOtpLimiter, verifyResetOtp);
router.get('/auth/verify-reset-token', resetPasswordLimiter, verifyResetToken);
router.post('/auth/reset-password', resetPasswordLimiter, resetPassword);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticateToken, getMe);

// --- 3. QR Customer Check-In (Public Flow) ---
router.post('/checkin', handleCheckIn);
router.post('/checkin/:shopId', handleCheckIn);

// --- 4. Customer Directory & Privacy Operations ---
router.get('/customers', authenticateToken, requireRole(['owner', 'manager']), getCustomers);
router.get('/customers/:id', authenticateToken, requireRole(['owner', 'manager']), getCustomerById);

// Consent update, deletion, and export (Accessible via public Privacy Portal OR authenticated Owner/Manager)
router.patch('/customers/:id/consent', optionalAuth, updateCustomerConsent);
router.delete('/customers/:id', optionalAuth, deleteCustomerData);
router.get('/customers/:id/export', optionalAuth, exportCustomerData);

// --- 5. Category Offers & Automated Campaigns ---
router.get('/offers', authenticateToken, requireRole(['owner', 'manager']), getSentOffers);
router.post('/offers/send', authenticateToken, requireRole(['owner', 'manager']), sendOffer);

// --- 6. Email Service Verification (Nodemailer Gmail SMTP) ---
router.get('/email/status', authenticateToken, requireRole(['owner', 'manager']), checkEmailStatus);
router.post('/email/test', authenticateToken, requireRole(['owner']), sendTestEmail);

// --- 7. Operational Tasks & Strategic Next-Best Actions ---
router.get('/tasks', authenticateToken, requireRole(['owner', 'manager', 'staff']), getTasks);
router.patch('/tasks/:id/toggle', authenticateToken, requireRole(['owner', 'manager', 'staff']), toggleTask);

router.get('/actions', authenticateToken, requireRole(['owner', 'manager']), getActions);
router.post('/actions/:id/complete', authenticateToken, requireRole(['owner', 'manager']), completeAction);

// --- 8. Omnichannel Message Templates ---
router.get('/templates', authenticateToken, requireRole(['owner', 'manager', 'staff']), getTemplates);
router.patch('/templates/:id', authenticateToken, requireRole(['owner', 'manager', 'staff']), updateTemplate);

// --- 9. Reviews ---
router.get('/reviews', authenticateToken, requireRole(['owner', 'manager']), getReviews);
router.post('/reviews', addReview);

// --- 10. Compliance & System Audit Logs ---
router.get('/logs/consent', authenticateToken, requireRole(['owner', 'manager', 'auditor']), getConsentLogs);
router.get('/logs/audit', authenticateToken, requireRole(['owner', 'manager', 'auditor']), getAuditLogs);

// --- 11. Store Settings & Thresholds ---
router.get('/settings', authenticateToken, requireRole(['owner', 'manager']), getSettings);
router.put('/settings', authenticateToken, requireRole(['owner']), updateSettings);

// --- 12. Database Seeder (Restricted) ---
router.post('/seed', authenticateToken, requireRole(['owner']), seedDatabase);

// --- 13. Stage 2 & Stage 4 Governance & Stress Testing ---
router.get('/governance/framework', getGovernanceFramework);
router.get('/governance/synthetic-benchmark', getSyntheticBenchmark);
router.get('/governance/benchmark', getSyntheticBenchmark);
router.post('/governance/stress-test', authenticateToken, requireRole(['owner', 'manager', 'auditor']), handleOptOutStressTest);
router.post('/governance/stress-test/opt-out', authenticateToken, requireRole(['owner', 'manager', 'auditor']), handleOptOutStressTest);
router.post('/governance/fairness-audit', authenticateToken, requireRole(['owner', 'manager', 'auditor']), handleFairnessAudit);
router.post('/governance/retention-run', authenticateToken, requireRole(['owner']), handleRetentionJob);
router.post('/governance/retention/run', authenticateToken, requireRole(['owner']), handleRetentionJob);

export default router;
