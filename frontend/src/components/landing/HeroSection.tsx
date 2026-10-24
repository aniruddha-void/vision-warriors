import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, MessageSquare, Smartphone, Mail, Pin, Sparkles, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-16 overflow-hidden">
      {/* Hero Outer Panel */}
      <div className="relative max-w-7xl mx-auto rounded-[32px] sm:rounded-[36px] bg-dotted-pattern border border-black/[0.07] min-h-[640px] lg:min-h-[700px] flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 text-center shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Floating Card 1: Top-Left Sticky Note */}
        <div
          className="hidden min-[900px]:block absolute top-10 left-10 lg:left-14 w-[210px] p-4 rounded-[16px] bg-[#FFE96B] text-[#3B3200] shadow-[0_12px_28px_rgba(0,0,0,0.12)] -rotate-6 animate-gentle-float select-none z-10"
          style={{ '--tw-rotate': '-6deg' } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-sm inline-block" />
            <Pin className="w-3.5 h-3.5 text-[#3B3200]/60 rotate-12" />
          </div>
          <p className="font-serif italic text-[14px] leading-snug font-medium text-left">
            “Customers choose what you can use. Always.”
          </p>
          <div className="mt-2 text-[11px] font-sans text-[#3B3200]/70 text-right font-medium">
            Privacy promise
          </div>
        </div>

        {/* Floating Card 2: Left, below note - White Checkbox Tile */}
        <div
          className="hidden min-[900px]:flex absolute top-56 left-8 lg:left-20 items-center gap-3 px-4 py-3 rounded-[18px] bg-white border border-black/[0.06] shadow-[0_14px_30px_rgba(0,0,0,0.08)] rotate-4 animate-gentle-float z-10"
          style={{ '--tw-rotate': '4deg', animationDelay: '1.2s' } as React.CSSProperties}
        >
          <div className="w-8 h-8 rounded-full bg-[#2F6BFF]/10 flex items-center justify-center text-[#2F6BFF]">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <div className="text-[11px] uppercase tracking-wider text-[#6E6E73] font-medium">Consent Active</div>
            <div className="text-[13px] font-semibold text-[#0B0B0C]">Zero dark patterns</div>
          </div>
        </div>

        {/* Floating Card 3: Top-Right - Today's actions */}
        <div
          className="hidden min-[900px]:block absolute top-12 right-10 lg:right-16 w-[230px] p-4 rounded-[20px] bg-white border border-black/[0.07] shadow-[0_14px_34px_rgba(0,0,0,0.09)] rotate-6 animate-gentle-float text-left z-10"
          style={{ '--tw-rotate': '6deg', animationDelay: '2.5s' } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Today's actions
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1EC0FF]/15 text-[#0070A3] text-[11px] font-semibold tabular-nums">
              <Clock className="w-3 h-3" /> 13:00 - 13:45
            </span>
          </div>
          <div className="text-[14px] font-semibold text-[#0B0B0C] leading-snug">
            Win back 12 customers
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#22C55E] font-medium">
            <Sparkles className="w-3.5 h-3.5" /> High confidence (78%)
          </div>
        </div>

        {/* Floating Card 4: Bottom-Left - Today's tasks with Cyan Progress */}
        <div
          className="hidden min-[900px]:block absolute bottom-10 left-12 lg:left-18 w-[240px] p-4 rounded-[20px] bg-white border border-black/[0.07] shadow-[0_14px_32px_rgba(0,0,0,0.08)] -rotate-3 animate-gentle-float text-left z-10"
          style={{ '--tw-rotate': '-3deg', animationDelay: '3.8s' } as React.CSSProperties}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-1">
            Today's tasks
          </div>
          <div className="text-[14px] font-semibold text-[#0B0B0C] mb-2.5">
            Send weekend offer
          </div>
          <div className="w-full bg-[#F1F1F2] rounded-full h-2 mb-1 overflow-hidden">
            <div className="bg-[#1EC0FF] h-2 rounded-full w-[60%]" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#6E6E73] font-medium">
            <span>Progress</span>
            <span className="tabular-nums font-semibold text-[#0B0B0C]">60%</span>
          </div>
        </div>

        {/* Floating Card 5: Bottom-Right - Channels */}
        <div
          className="hidden min-[900px]:block absolute bottom-12 right-12 lg:right-20 p-4 rounded-[20px] bg-white border border-black/[0.07] shadow-[0_14px_32px_rgba(0,0,0,0.08)] rotate-5 animate-gentle-float z-10"
          style={{ '--tw-rotate': '5deg', animationDelay: '4.5s' } as React.CSSProperties}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-2.5 text-left">
            Preferred channels
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]" title="WhatsApp">
              <MessageSquare className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="w-9 h-9 rounded-[12px] bg-[#2F6BFF]/10 flex items-center justify-center text-[#2F6BFF]" title="SMS">
              <Smartphone className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="w-9 h-9 rounded-[12px] bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]" title="Email">
              <Mail className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Center: Brand App-Icon Tile */}
        <div className="w-20 h-20 rounded-[24px] bg-white border border-black/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.08)] flex items-center justify-center mb-8 relative">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="5" fill="#1EC0FF" />
            <circle cx="24" cy="8" r="5" fill="#0B0B0C" />
            <circle cx="8" cy="24" r="5" fill="#0B0B0C" />
            <circle cx="24" cy="24" r="5" fill="#0B0B0C" />
          </svg>
        </div>

        {/* Hero Two-Tone Headline */}
        <h1 className="text-[38px] sm:text-[54px] lg:text-[70px] font-medium tracking-tight leading-[1.06] max-w-4xl mx-auto mb-6">
          <span className="block text-[#0B0B0C]">Know your next move</span>
          <span className="block text-[#9A9A9E]">respect every choice</span>
        </h1>

        {/* Subtext */}
        <p className="text-[17px] sm:text-[19px] text-[#3A3A3D] max-w-2xl mx-auto mb-9 font-normal leading-relaxed">
          Simple, explainable actions for your shop, using only the data your customers agree to share.
        </p>

        {/* Primary CTA and Secondary Link */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/app')}
            className="w-full sm:w-auto h-[46px] px-8 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-[15px] shadow-[0_4px_16px_rgba(47,107,255,0.28)] hover:shadow-[0_6px_20px_rgba(47,107,255,0.36)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get free demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/consent/C-1002')}
            className="w-full sm:w-auto h-[46px] px-6 rounded-[12px] bg-white border border-black/[0.12] hover:border-black/[0.2] text-[#0B0B0C] font-medium text-[15px] shadow-[0_2px_4px_rgba(0,0,0,0.03)] hover:bg-[#FAFAFA] transition-all cursor-pointer"
          >
            Try customer consent portal
          </button>
        </div>

        {/* Micro reassurance badge */}
        <div className="mt-8 flex items-center gap-2 text-[13px] text-[#6E6E73]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span>Zero third-party trackers &bull; 100% explainable &bull; Instant data deletion</span>
        </div>

      </div>
    </section>
  );
};
