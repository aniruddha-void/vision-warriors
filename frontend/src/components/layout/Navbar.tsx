import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Features', href: '#features' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Fallback demo', href: '/offers' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F6F6F7]/85 border-b border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Nova Insights Home">
          <Logo size="md" showSubtitle={true} />
        </Link>

        {/* Center: Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-[#3A3A3D] hover:text-[#0B0B0C] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-[15px] font-medium text-[#3A3A3D] hover:text-[#0B0B0C] transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-[15px] font-medium text-[#3A3A3D] hover:text-[#0B0B0C] px-3 py-2 transition-colors"
          >
            Sign in
          </Link>
          <button
            onClick={() => navigate('/app')}
            className="h-[38px] px-4 rounded-[12px] bg-white border border-black/[0.12] hover:border-black/[0.22] shadow-[0_2px_4px_rgba(0,0,0,0.03)] text-[14px] font-medium text-[#0B0B0C] hover:bg-[#F9F9FA] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Get demo</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6E6E73]" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#0B0B0C] hover:bg-black/5"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-black/[0.08] px-6 py-6 shadow-xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#3A3A3D] hover:text-[#0B0B0C] py-1"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#3A3A3D] hover:text-[#0B0B0C] py-1"
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="pt-4 border-t border-black/[0.06] flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-base font-medium text-[#3A3A3D]"
              >
                Sign in
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app');
                }}
                className="w-full h-[46px] rounded-[12px] bg-[#2F6BFF] text-white font-medium hover:bg-[#1F58E6] transition-colors"
              >
                Open demo app
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
