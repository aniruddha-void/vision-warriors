import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { useNovaStore } from '../../store/useNovaStore';
import { UserRole } from '../../types';
import { ArrowRight, Sparkles, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useNovaStore();

  const [email, setEmail] = useState('amanda@chaiandco.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole('owner');
    navigate('/app');
  };

  const handleRoleLogin = (role: UserRole) => {
    setRole(role);
    if (role === 'staff') {
      navigate('/app/tasks');
    } else if (role === 'auditor') {
      navigate('/app/consent-log');
    } else {
      navigate('/app');
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
            Sign in to Nova Insights
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1">
            Chai & Co customer tracking & explainable category offers
          </p>
        </div>

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
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#3A3A3D]">
                Password
              </label>
              <a href="#" className="text-xs text-[#2F6BFF] hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-xs text-[#0B0B0C] outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-[44px] rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <span>Sign in as Owner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-[#9A9A9E] uppercase font-semibold">
            or instant demo role picker
          </span>
        </div>

        {/* Demo Role Picker Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleRoleLogin('owner')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" /> Owner
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Full access & unmasked</div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleLogin('manager')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#2F6BFF]" /> Manager
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Masked contacts & offers</div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleLogin('staff')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Staff
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Tasks & templates only</div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleLogin('auditor')}
            className="p-2.5 rounded-[12px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.06] text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-[#0B0B0C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" /> Auditor
            </div>
            <div className="text-[10px] text-[#6E6E73] mt-0.5">Consent & audit read-only</div>
          </button>
        </div>

        <div className="pt-3 border-t border-black/[0.06] text-center text-[11px] text-[#6E6E73] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Role-based access control (RBAC) enforced</span>
        </div>

      </div>

      <div className="mt-5 text-center text-xs text-[#6E6E73]">
        New business?{' '}
        <Link to="/signup" className="text-[#2F6BFF] font-medium hover:underline">
          Create shop account
        </Link>
      </div>
    </div>
  );
};
