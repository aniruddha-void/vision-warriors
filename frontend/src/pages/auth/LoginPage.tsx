import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { useNovaStore } from '../../store/useNovaStore';
import { novaApi } from '../../lib/api';
import { UserRole } from '../../types';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Loader2,
  X,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetTokenParam = searchParams.get('resetToken') || searchParams.get('token');

  const { setCurrentUser } = useNovaStore();

  const [email, setEmail] = useState('amanda@chaiandco.com');
  const [password, setPassword] = useState('DemoOwner2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal state (OTP Multi-Step Flow)
  type ModalStep = 'email' | 'otp' | 'otp-verified' | 'new-password' | 'password-success';
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('email');

  // Step 1: Email
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Step 3 & 4: Reset Authorization Token & Password Reset Form
  const [resetAuthToken, setResetAuthToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Live password validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const hasMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const resetForgotModal = () => {
    setShowForgotModal(false);
    setModalStep('email');
    setForgotError(null);
    setOtp('');
    setOtpError(null);
    setResendMessage(null);
    setResetAuthToken(null);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResetError(null);
  };

  const maskEmail = (emailStr: string): string => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const [local, domain] = emailStr.split('@');
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
  };

  useEffect(() => {
    if (resetTokenParam) {
      navigate(`/reset-password?token=${encodeURIComponent(resetTokenParam)}`, { replace: true });
    } else if (searchParams.get('forgot') === 'true') {
      setShowForgotModal(true);
    }
  }, [resetTokenParam, searchParams, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await novaApi.login({ email: email.trim(), password });
      if (res.success && res.user) {
        setCurrentUser(res.user, res.token);
        if (res.user.role === 'staff') {
          navigate('/app/tasks');
        } else if (res.user.role === 'auditor') {
          navigate('/app/consent-log');
        } else {
          navigate('/app');
        }
      } else {
        setErrorMessage('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleLogin = async (role: UserRole) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingRole(role);

    try {
      // Connect to genuine server-side demo authentication
      const res = await novaApi.demoLogin(role as 'owner' | 'manager' | 'staff' | 'auditor');
      if (res.success && res.user) {
        setCurrentUser(res.user, res.token);
        if (role === 'staff') {
          navigate('/app/tasks');
        } else if (role === 'auditor') {
          navigate('/app/consent-log');
        } else {
          navigate('/app');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to authenticate as ${role}. Please check server.`);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const emailTrimmed = forgotEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setForgotError('Please enter a valid retailer email address.');
      return;
    }

    setForgotLoading(true);

    try {
      await novaApi.forgotPassword(emailTrimmed);
      setModalStep('otp');
      setResendCountdown(60);
      setOtp('');
      setOtpError(null);
    } catch (err: any) {
      setForgotError(err.message || 'Unable to process OTP request. Please check email address.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await novaApi.verifyResetOtp({
        email: forgotEmail.trim(),
        otp: cleanOtp,
      });

      if (res.success && res.resetToken) {
        setResetAuthToken(res.resetToken);
        setModalStep('otp-verified');
      } else {
        setOtpError(res.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpError(null);
    setResendMessage(null);

    try {
      const res = await novaApi.resendResetOtp(forgotEmail.trim());
      setResendMessage(res.message || 'A new 6-digit code has been sent.');
      setResendCountdown(60);
      setTimeout(() => setResendMessage(null), 5000);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!isPasswordValid) {
      setResetError('Password must meet all complexity requirements (8+ chars, upper, lower, number).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (!resetAuthToken) {
      setResetError('Reset authorization expired. Please verify OTP again.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await novaApi.resetPassword({
        resetToken: resetAuthToken,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setModalStep('password-success');
      } else {
        setResetError(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. Authorization may have expired.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dotted-pattern flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="mb-6" aria-label="Back to home">
        <Logo size="lg" showSubtitle={true} />
      </Link>

      <div className="w-full max-w-md bg-white rounded-[28px] border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        
        {/* App Icon Tile */}
        <div className="w-14 h-14 rounded-[18px] bg-[#F1F1F2] border border-black/[0.06] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="8" cy="8" r="4.5" fill="#1EC0FF" />
            <circle cx="24" cy="8" r="4.5" fill="#0B0B0C" />
            <circle cx="8" cy="24" r="4.5" fill="#0B0B0C" />
            <circle cx="24" cy="24" r="4.5" fill="#0B0B0C" />
          </svg>
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-[#0B0B0C] tracking-tight">
            {resetTokenParam ? 'Reset your password' : 'Sign in to Nova Insights'}
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1">
            Privacy-first customer tracking & explainable category intelligence
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-[12px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-[12px] bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
              Retailer email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-xs text-[#2F6BFF] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9E] hover:text-[#0B0B0C] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign in to shop</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Role Picker Header */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-[#9A9A9E] uppercase font-semibold">
            or authenticated demo accounts
          </span>
        </div>

        {/* Demo Role Picker Grid (Backed by real server identities) */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleRoleLogin('owner')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              {loadingRole === 'owner' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />}
              <span>Owner</span>
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Full access & unmasked</div>
          </button>

          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleRoleLogin('manager')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              {loadingRole === 'manager' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5 text-[#2F6BFF]" />}
              <span>Manager</span>
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Masked contacts & offers</div>
          </button>

          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleRoleLogin('staff')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              {loadingRole === 'staff' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5 text-[#16A34A]" />}
              <span>Staff</span>
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Tasks & templates only</div>
          </button>

          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleRoleLogin('auditor')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              {loadingRole === 'auditor' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />}
              <span>Auditor</span>
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Consent & audit read-only</div>
          </button>
        </div>

        <div className="pt-3 border-t border-black/[0.06] text-center text-[11px] text-[#6E6E73] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Server-verified JWT authentication & RBAC boundary</span>
        </div>

      </div>

      <div className="mt-5 text-center text-xs text-[#6E6E73]">
        New business?{' '}
        <Link to="/signup" className="text-[#2F6BFF] font-medium hover:underline">
          Create shop account
        </Link>
      </div>

      {/* Forgot Password Modal (OTP Verification Flow) */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-black/[0.08] shadow-2xl relative">
            <button
              onClick={resetForgotModal}
              className="absolute top-4 right-4 text-[#9A9A9E] hover:text-[#0B0B0C] cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STEP 1: Enter Email & Send OTP */}
            {modalStep === 'email' && (
              <div>
                <div className="w-10 h-10 rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-[#0B0B0C] mb-1">
                  Reset your password
                </h3>
                <p className="text-xs text-[#6E6E73] mb-4">
                  Enter your registered retailer email address. We will send a 6-digit verification code.
                </p>

                {forgotError && (
                  <div className="mb-3 p-2.5 rounded-[10px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#3A3A3D] mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="retailer@domain.com"
                      className="w-full h-10 px-3 rounded-[10px] bg-[#F9F9FA] border border-black/[0.1] text-xs text-[#0B0B0C] outline-none focus:border-[#2F6BFF] focus:bg-white"
                      required
                      disabled={forgotLoading}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full h-10 rounded-[10px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Verify Email OTP */}
            {modalStep === 'otp' && (
              <div>
                <div className="w-10 h-10 rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-[#0B0B0C] mb-1">
                  Verify your email
                </h3>
                
                <div className="flex items-center justify-between text-xs text-[#6E6E73] mb-4 pb-2 border-b border-black/[0.05]">
                  <span>Sent to <strong className="text-[#0B0B0C]">{maskEmail(forgotEmail)}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotError(null);
                      setModalStep('email');
                    }}
                    className="text-[#2F6BFF] hover:underline cursor-pointer font-medium"
                  >
                    Change
                  </button>
                </div>

                {resendMessage && (
                  <div className="mb-3 p-2.5 rounded-[10px] bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{resendMessage}</span>
                  </div>
                )}

                {otpError && (
                  <div className="mb-3 p-2.5 rounded-[10px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#3A3A3D] mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full h-11 text-center text-lg font-mono tracking-[0.4em] font-bold rounded-[10px] bg-[#F9F9FA] border border-black/[0.1] text-[#0B0B0C] outline-none focus:border-[#2F6BFF] focus:bg-white transition-all"
                      required
                      autoFocus
                      disabled={otpLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otp.length !== 6}
                    className="w-full h-10 rounded-[10px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <span>Verify OTP</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setModalStep('email')}
                      className="text-xs text-[#6E6E73] hover:text-[#0B0B0C] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to email</span>
                    </button>

                    <div>
                      {resendCountdown > 0 ? (
                        <span className="text-[11px] text-[#9A9A9E]">
                          Resend in {resendCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendLoading}
                          className="text-[11px] text-[#2F6BFF] hover:underline font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: OTP Verified Successfully */}
            {modalStep === 'otp-verified' && (
              <div className="text-center py-2 space-y-4">
                <div className="w-12 h-12 rounded-[16px] bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#16A34A] mb-1">
                    OTP Verified Successfully
                  </h3>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Your email identity has been confirmed. You can now create a new password for your retailer account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalStep('new-password')}
                  className="w-full h-10 rounded-[10px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 4: Enter New Password */}
            {modalStep === 'new-password' && (
              <div>
                <div className="w-10 h-10 rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-[#0B0B0C] mb-1">
                  Reset your password
                </h3>
                <p className="text-xs text-[#6E6E73] mb-3">
                  Enter and confirm your new secure retailer password.
                </p>

                {resetError && (
                  <div className="mb-3 p-2.5 rounded-[10px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  {/* New Password */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#3A3A3D] mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full h-10 px-3 pr-9 rounded-[10px] bg-[#F9F9FA] border border-black/[0.1] text-xs text-[#0B0B0C] outline-none focus:border-[#2F6BFF] focus:bg-white"
                        required
                        disabled={resetLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A9E] hover:text-[#0B0B0C] cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Complexity Checklist */}
                    <div className="grid grid-cols-2 gap-1 mt-1.5 p-2 rounded-[8px] bg-[#F9F9FA] border border-black/[0.05] text-[10px]">
                      <div className={`flex items-center gap-1 ${hasMinLength ? 'text-[#16A34A] font-medium' : 'text-[#9A9A9E]'}`}>
                        <Check className={`w-3 h-3 ${hasMinLength ? 'text-[#16A34A]' : 'opacity-40'}`} />
                        <span>8+ chars</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasUppercase ? 'text-[#16A34A] font-medium' : 'text-[#9A9A9E]'}`}>
                        <Check className={`w-3 h-3 ${hasUppercase ? 'text-[#16A34A]' : 'opacity-40'}`} />
                        <span>Uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasLowercase ? 'text-[#16A34A] font-medium' : 'text-[#9A9A9E]'}`}>
                        <Check className={`w-3 h-3 ${hasLowercase ? 'text-[#16A34A]' : 'opacity-40'}`} />
                        <span>Lowercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasNumber ? 'text-[#16A34A] font-medium' : 'text-[#9A9A9E]'}`}>
                        <Check className={`w-3 h-3 ${hasNumber ? 'text-[#16A34A]' : 'opacity-40'}`} />
                        <span>Number (0-9)</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#3A3A3D] mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full h-10 px-3 pr-9 rounded-[10px] bg-[#F9F9FA] border ${
                          hasMismatch
                            ? 'border-[#EF4444]'
                            : passwordsMatch
                            ? 'border-[#16A34A]'
                            : 'border-black/[0.1]'
                        } text-xs text-[#0B0B0C] outline-none focus:border-[#2F6BFF] focus:bg-white`}
                        required
                        disabled={resetLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A9E] hover:text-[#0B0B0C] cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div className="mt-1 text-[10px] font-medium">
                        {passwordsMatch ? (
                          <span className="text-[#16A34A] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Passwords match
                          </span>
                        ) : (
                          <span className="text-[#EF4444] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || !isPasswordValid || !passwordsMatch}
                    className="w-full h-10 rounded-[10px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Resetting password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 5: Password Reset Successfully */}
            {modalStep === 'password-success' && (
              <div className="text-center py-2 space-y-4">
                <div className="w-12 h-12 rounded-[16px] bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0B0B0C] mb-1">
                    Password Reset Successfully
                  </h3>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Your password has been securely updated. You can now sign in using your new credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setEmail(forgotEmail);
                    setPassword('');
                    setSuccessMessage('Password reset successfully. Please sign in with your new password.');
                  }}
                  className="w-full h-10 rounded-[10px] bg-[#0B0B0C] hover:bg-[#1F1F24] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Back to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
