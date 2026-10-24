import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('Chai & Co');
  const [name, setName] = useState('Amanda');
  const [email, setEmail] = useState('amanda@chaiandco.com');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-dotted-pattern flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="mb-8" aria-label="Back to home">
        <Logo size="lg" showSubtitle={true} />
      </Link>

      <div className="w-full max-w-md bg-white rounded-[28px] border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
        
        <div className="w-14 h-14 rounded-[18px] bg-[#F1F1F2] border border-black/[0.06] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="8" cy="8" r="4.5" fill="#1EC0FF" />
            <circle cx="24" cy="8" r="4.5" fill="#0B0B0C" />
            <circle cx="8" cy="24" r="4.5" fill="#0B0B0C" />
            <circle cx="24" cy="24" r="4.5" fill="#0B0B0C" />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Create your shop account
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1">
            Get privacy-safe next best actions for your business
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1.5">
              Shop / Business name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-sm text-[#0B0B0C] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1.5">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-sm text-[#0B0B0C] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-sm text-[#0B0B0C] outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-[46px] rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Create account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <span className="relative bg-white px-3 text-xs text-[#9A9A9E] uppercase font-medium">
            or instant preview
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app')}
          className="w-full h-[44px] rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.08] text-[#0B0B0C] font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>Continue as demo owner (Amanda)</span>
        </button>

        <div className="mt-6 pt-4 border-t border-black/[0.06] text-center text-xs text-[#6E6E73] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Includes free built-in customer consent manager</span>
        </div>

      </div>

      <div className="mt-6 text-center text-xs text-[#6E6E73]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#2F6BFF] font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
