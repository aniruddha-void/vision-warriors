import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size="sm" showSubtitle={true} />
          <p className="text-xs text-[#6E6E73] text-center md:text-left">
            Privacy-first next-best-action intelligence for neighborhood businesses.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-[#3A3A3D]">
          <Link to="/privacy" className="hover:text-[#0B0B0C] transition-colors">
            Privacy promise
          </Link>
          <Link to="/consent/C-1002" className="hover:text-[#0B0B0C] transition-colors">
            Consent manager
          </Link>
          <Link to="/offers" className="hover:text-[#0B0B0C] transition-colors">
            Fallback offers
          </Link>
          <Link to="/app" className="hover:text-[#0B0B0C] transition-colors font-medium text-[#2F6BFF]">
            Owner app
          </Link>
        </div>

        <div className="text-xs text-[#9A9A9E]">
          &copy; {new Date().getFullYear()} Nova Insights. Light mode only &bull; Zero tracking cookies.
        </div>

      </div>
    </footer>
  );
};
