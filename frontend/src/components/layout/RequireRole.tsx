import React from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { currentRole, setRole } = useNovaStore();
  const navigate = useNavigate();

  if (roles.includes(currentRole)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-[24px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-[#0B0B0C] mb-2">
        Access restricted
      </h1>

      <p className="text-sm text-[#6E6E73] max-w-md mb-6 leading-relaxed">
        Your current role is <b className="capitalize text-[#0B0B0C]">{currentRole}</b>. This section is reserved for{' '}
        <span className="font-medium text-[#2F6BFF]">{roles.join(' or ')}</span>.
      </p>

      {/* Quick Demo Switcher on No-Access */}
      <div className="p-4 rounded-[18px] bg-white border border-black/[0.08] shadow-sm mb-6 flex items-center gap-3">
        <span className="text-xs text-[#6E6E73] font-medium flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-[#2F6BFF]" /> Switch role for demo:
        </span>
        <div className="flex items-center gap-1.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="h-8 px-3 rounded-[8px] bg-[#2F6BFF] text-white text-xs font-semibold hover:bg-[#1F58E6] transition-colors cursor-pointer capitalize"
            >
              Switch to {r}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (currentRole === 'staff') navigate('/app/tasks');
          else if (currentRole === 'auditor') navigate('/app/consent-log');
          else navigate('/app');
        }}
        className="h-10 px-5 rounded-[12px] bg-[#0B0B0C] text-white text-xs font-medium flex items-center gap-2 cursor-pointer hover:bg-[#2F6BFF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to permitted workspace</span>
      </button>
    </div>
  );
};
