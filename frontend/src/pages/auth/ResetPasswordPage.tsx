import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { novaApi } from '../../lib/api';
import {
  KeyRound,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // Token verification states
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Form input states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Live password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const hasMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Verify token on mount with backend
  useEffect(() => {
    if (!token || !token.trim()) {
      setVerifying(false);
      setTokenValid(false);
      setVerificationError('No password reset token was provided in the link.');
      return;
    }

    let isMounted = true;
    novaApi
      .verifyResetToken(token.trim())
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setVerificationError(res.message || 'Password reset link is invalid, expired, or has already been used.');
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setTokenValid(false);
        setVerificationError(err.message || 'Password reset link is invalid, expired, or has already been used.');
      })
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isPasswordValid) {
      setSubmitError('Password must meet all complexity requirements (8+ characters, uppercase, lowercase, and a number).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await novaApi.resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSubmitSuccess(res.message || 'Password reset successfully. You can now sign in with your new credentials.');
      } else {
        setSubmitError(res.message || 'Failed to reset password. Please try again or request a new link.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to reset password. The link may have expired or was already used.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dotted-pattern flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="mb-6" aria-label="Back to home">
        <Logo size="lg" showSubtitle={true} />
      </Link>

      <div className="w-full max-w-md bg-white rounded-[28px] border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-[18px] bg-[#F1F1F2] border border-black/[0.06] flex items-center justify-center mx-auto mb-5 shadow-sm text-[#2F6BFF]">
          <KeyRound className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0B0B0C] tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1">
            Choose a strong new password for your Nova Insights retailer account
          </p>
        </div>

        {/* State 1: Verifying token with server */}
        {verifying && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2F6BFF] animate-spin mx-auto" />
            <p className="text-xs font-medium text-[#3A3A3D]">
              Verifying secure authorization link...
            </p>
            <p className="text-[11px] text-[#9A9A9E]">
              Validating token authenticity and expiration with server
            </p>
          </div>
        )}

        {/* State 2: Token verification failed (invalid, expired, used, or missing) */}
        {!verifying && tokenValid === false && (
          <div className="space-y-4">
            <div className="p-4 rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Link Invalid or Expired</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#EF4444]/90">
                {verificationError || 'This password reset link is invalid, expired, or has already been used.'}
              </p>
            </div>

            <p className="text-xs text-[#6E6E73] leading-relaxed text-center">
              Password reset authorization tokens are time-sensitive and single-use for your security. Please request a fresh OTP verification code to update your credentials.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/login?forgot=true')}
                className="w-full h-11 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request OTP verification code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/login"
                className="w-full h-11 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-[#3A3A3D] font-medium text-xs transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Password updated successfully */}
        {!verifying && submitSuccess && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-[16px] bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-xs space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#16A34A]" />
              <h2 className="text-sm font-bold text-[#16A34A]">Password Reset Successfully</h2>
              <p className="text-[11px] leading-relaxed text-[#16A34A]/90">
                {submitSuccess}
              </p>
            </div>

            <p className="text-xs text-[#6E6E73] text-center">
              Your previous password has been revoked. You can now access your shop dashboard using your new password.
            </p>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-[12px] bg-[#0B0B0C] hover:bg-[#1F1F24] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign in with new password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 4: Token verified -> Display Reset Password Form */}
        {!verifying && tokenValid === true && !submitSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {submitError && (
              <div className="p-3 rounded-[12px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong new password"
                  className="w-full h-11 px-3.5 pr-10 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none transition-all"
                  required
                  disabled={submitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9E] hover:text-[#0B0B0C] cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Checklist */}
              <div className="grid grid-cols-2 gap-1.5 mt-2 p-2.5 rounded-[10px] bg-[#F9F9FA] border border-black/[0.05] text-[10px]">
                <div className={`flex items-center gap-1 ${hasMinLength ? 'text-[#16A34A] font-semibold' : 'text-[#9A9A9E]'}`}>
                  <Check className={`w-3 h-3 ${hasMinLength ? 'text-[#16A34A]' : 'opacity-40'}`} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1 ${hasUppercase ? 'text-[#16A34A] font-semibold' : 'text-[#9A9A9E]'}`}>
                  <Check className={`w-3 h-3 ${hasUppercase ? 'text-[#16A34A]' : 'opacity-40'}`} />
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1 ${hasLowercase ? 'text-[#16A34A] font-semibold' : 'text-[#9A9A9E]'}`}>
                  <Check className={`w-3 h-3 ${hasLowercase ? 'text-[#16A34A]' : 'opacity-40'}`} />
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1 ${hasNumber ? 'text-[#16A34A] font-semibold' : 'text-[#9A9A9E]'}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? 'text-[#16A34A]' : 'opacity-40'}`} />
                  <span>Number (0-9)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={`w-full h-11 px-3.5 pr-10 rounded-[12px] bg-[#F9F9FA] border ${
                    hasMismatch
                      ? 'border-[#EF4444] focus:border-[#EF4444]'
                      : passwordsMatch
                      ? 'border-[#16A34A] focus:border-[#16A34A]'
                      : 'border-black/[0.1] focus:border-[#2F6BFF]'
                  } focus:bg-white text-xs text-[#0B0B0C] outline-none transition-all`}
                  required
                  disabled={submitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9E] hover:text-[#0B0B0C] cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Match Status */}
              {confirmPassword.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {passwordsMatch ? (
                    <div className="text-[#16A34A] flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="text-[#EF4444] flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isPasswordValid || !passwordsMatch}
              className="w-full h-11 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Reset password & sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to sign in link */}
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs text-[#6E6E73] hover:text-[#0B0B0C] inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </form>
        )}

        {/* Security badge at bottom */}
        <div className="pt-4 mt-6 border-t border-black/[0.06] text-center text-[11px] text-[#6E6E73] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Bcrypt salted password encryption & single-use SHA-256 tokens</span>
        </div>

      </div>
    </div>
  );
};
