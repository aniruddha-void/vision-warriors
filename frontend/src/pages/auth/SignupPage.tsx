import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { useNovaStore } from '../../store/useNovaStore';
import { novaApi } from '../../lib/api';
import { ArrowRight, Sparkles, ShieldCheck, AlertCircle, Loader2, Check } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useNovaStore();

  const [shopName, setShopName] = useState('Chai & Co');
  const [name, setName] = useState('Amanda');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Please ensure your password satisfies all security criteria');
      return;
    }

    setLoading(true);

    try {
      const res = await novaApi.register({
        shopName: shopName.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.success && res.user) {
        setCurrentUser(res.user, res.token);
        navigate('/app');
      } else {
        setErrorMessage('Registration failed. Please check your information.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account creation');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoContinue = async () => {
    setDemoLoading(true);
    setErrorMessage(null);

    try {
      const res = await novaApi.demoLogin('owner');
      if (res.success && res.user) {
        setCurrentUser(res.user, res.token);
        navigate('/app');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo authentication failed. Please check server.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dotted-pattern flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="mb-6" aria-label="Back to home">
        <Logo size="lg" showSubtitle={true} />
      </Link>

      <div className="w-full max-w-md bg-white rounded-[28px] border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        
        <div className="w-14 h-14 rounded-[18px] bg-[#F1F1F2] border border-black/[0.06] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="8" cy="8" r="4.5" fill="#1EC0FF" />
            <circle cx="24" cy="8" r="4.5" fill="#0B0B0C" />
            <circle cx="8" cy="24" r="4.5" fill="#0B0B0C" />
            <circle cx="24" cy="24" r="4.5" fill="#0B0B0C" />
          </svg>
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Create your shop account
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1">
            Privacy-safe consumer intelligence & automated customer campaigns
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-[12px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
              Shop / Business name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Chai & Co"
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
              Your name (Owner)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amanda"
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
              Retailer email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amanda@retail.com"
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter at least 8 characters"
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
              required
              disabled={loading}
            />
            
            {/* Live Password Strength Criteria */}
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

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full h-[44px] rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating isolated shop account...</span>
              </>
            ) : (
              <>
                <span>Create shop account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-[#9A9A9E] uppercase font-medium">
            or instant demo preview
          </span>
        </div>

        <button
          type="button"
          disabled={demoLoading}
          onClick={handleDemoContinue}
          className="w-full h-[42px] rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.08] text-[#0B0B0C] font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {demoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          )}
          <span>Continue as demo owner (Amanda)</span>
        </button>

        <div className="mt-5 pt-3 border-t border-black/[0.06] text-center text-[11px] text-[#6E6E73] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Includes free built-in customer consent manager & RBAC</span>
        </div>

      </div>

      <div className="mt-5 text-center text-xs text-[#6E6E73]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#2F6BFF] font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
