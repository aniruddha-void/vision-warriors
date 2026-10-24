import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const FinalCta: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-[32px] sm:rounded-[36px] bg-dotted-pattern border border-black/[0.08] p-10 sm:p-16 lg:p-20 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
        
        {/* Subtle decorative circles */}
        <div className="w-16 h-16 rounded-[20px] bg-white border border-black/[0.08] shadow-sm flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="8" cy="8" r="4.5" fill="#1EC0FF" />
            <circle cx="24" cy="8" r="4.5" fill="#0B0B0C" />
            <circle cx="8" cy="24" r="4.5" fill="#0B0B0C" />
            <circle cx="24" cy="24" r="4.5" fill="#0B0B0C" />
          </svg>
        </div>

        <h2 className="text-[34px] sm:text-[48px] font-medium text-[#0B0B0C] tracking-tight mb-4">
          Know your next move
        </h2>
        <p className="text-[17px] text-[#6E6E73] max-w-xl mx-auto mb-8">
          Join small neighborhood businesses using explainable, consent-driven actions. No tracking baggage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/app')}
            className="w-full sm:w-auto h-[46px] px-8 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-[15px] shadow-[0_4px_16px_rgba(47,107,255,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get free demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/offers')}
            className="w-full sm:w-auto h-[46px] px-6 rounded-[12px] bg-white border border-black/[0.12] hover:border-black/[0.2] text-[#0B0B0C] font-medium text-[15px] hover:bg-[#FAFAFA] transition-all cursor-pointer"
          >
            View non-personalised fallback page
          </button>
        </div>

      </div>
    </section>
  );
};
