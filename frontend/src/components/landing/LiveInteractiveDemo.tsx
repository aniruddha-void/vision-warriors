import React, { useState } from 'react';
import { PillBadge } from '../ui/PillBadge';
import { Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveInteractiveDemo: React.FC = () => {
  const [hasConsent, setHasConsent] = useState(true);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <PillBadge dotColor="#22C55E" className="mb-4">
          Live Interactive Demo
        </PillBadge>
        <h2 className="text-[32px] sm:text-[44px] font-medium text-[#0B0B0C] tracking-tight leading-[1.12]">
          See what happens when consent flips
        </h2>
        <p className="mt-3 text-[16px] text-[#6E6E73]">
          Toggle customer consent below to watch the offer adapt in real time without any tracking penalties.
        </p>
      </div>

      {/* Interactive Switch Container */}
      <div className="bg-white rounded-[32px] border border-black/[0.08] p-6 sm:p-10 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
        
        {/* Toggle Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[20px] bg-[#F1F1F2] mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${hasConsent ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
            <div>
              <div className="text-sm font-semibold text-[#0B0B0C]">
                Customer Consent: {hasConsent ? 'GRANTED (Personalised)' : 'WITHDRAWN (Fallback Mode)'}
              </div>
              <div className="text-xs text-[#6E6E73]">
                {hasConsent
                  ? 'Customer permitted visit frequency & purchase history preferences'
                  : 'Customer opted out. Zero private attributes are accessed.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setHasConsent(!hasConsent)}
            className={`px-5 py-2.5 rounded-[12px] font-medium text-sm transition-all cursor-pointer flex items-center gap-2 ${
              hasConsent
                ? 'bg-[#2F6BFF] text-white hover:bg-[#1F58E6] shadow-sm'
                : 'bg-white text-[#0B0B0C] border border-black/[0.1] hover:bg-[#F9F9FA]'
            }`}
          >
            <span>Switch to {hasConsent ? 'Consent OFF' : 'Consent ON'}</span>
          </button>
        </div>

        {/* Card Comparison State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Offer Presentation Card */}
          <div
            className={`rounded-[24px] p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between ${
              hasConsent
                ? 'bg-gradient-to-br from-white to-[#F0F7FF] border-[#2F6BFF]/30 shadow-[0_8px_24px_rgba(47,107,255,0.08)]'
                : 'bg-[#FFFBEB] border-[#F59E0B]/30 shadow-[0_8px_24px_rgba(245,158,11,0.08)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    hasConsent
                      ? 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                      : 'bg-[#F59E0B]/15 text-[#B45309]'
                  }`}
                >
                  {hasConsent ? '✨ Personalised for you' : '🏷️ General cafe offer'}
                </span>
                <span className="text-xs text-[#6E6E73] font-medium">
                  {hasConsent ? 'Patron: Diya Patel' : 'Anonymous guest'}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-[#0B0B0C] mb-2">
                {hasConsent
                  ? 'Free Bun Maska with your favorite Cardamom Cold Brew'
                  : 'Cutting Chai & Crunchy Samosa Platter'}
              </h3>

              <p className="text-sm text-[#3A3A3D] leading-relaxed mb-6">
                {hasConsent
                  ? 'We noticed it has been 28 days since your last cup. Enjoy a freshly buttered Bun Maska on the house when you drop in this week!'
                  : 'Popular neighborhood afternoon combo. Hot ginger chai paired with freshly fried spiced potato samosas. Available all day.'}
              </p>
            </div>

            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
              <span className="text-lg font-bold text-[#0B0B0C]">
                {hasConsent ? 'Gift Voucher ₹0' : '₹120 flat'}
              </span>
              <span className="text-xs text-[#6E6E73]">
                {hasConsent ? 'Valid till Sunday' : 'Open to everyone'}
              </span>
            </div>
          </div>

          {/* Explainability / Logic Inspector Card */}
          <div className="rounded-[24px] bg-[#F6F6F7] p-6 sm:p-8 border border-black/[0.06] flex flex-col justify-between text-left">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2F6BFF]" /> How Nova determined this
              </div>

              {hasConsent ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#3A3A3D]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span><b>Visit frequency consented:</b> Detected 28-day gap versus typical 4-day cadence.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#3A3A3D]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span><b>Order history consented:</b> Recommended paired accompaniment for cold brew.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#6E6E73]">
                    <span className="w-4 h-4 rounded-full bg-black/10 text-[#0B0B0C] flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
                    <span><b>Location not collected:</b> Store never queries GPS coordinates.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-[14px] bg-white border border-black/[0.06] text-xs text-[#6E6E73] leading-relaxed">
                    <strong className="text-[#0B0B0C] block mb-1">Fallback Mode Activated</strong>
                    Personalised recommendations are strictly disabled. The cafe uses aggregate store sales (anonymous) to display what customers enjoy most this season.
                  </div>
                  <div className="text-xs text-[#22C55E] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 100% compliant with privacy regulations
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between">
              <span className="text-xs text-[#6E6E73]">Inspect full customer portal:</span>
              <Link
                to="/consent/C-1002"
                className="text-xs font-semibold text-[#2F6BFF] hover:underline flex items-center gap-1"
              >
                <span>Open sample portal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
