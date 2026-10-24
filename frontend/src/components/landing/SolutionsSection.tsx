import React from 'react';
import { PillBadge } from '../ui/PillBadge';
import { Compass, Lightbulb, ShieldCheck, Check, Sparkles, Users, Target, CheckSquare, FileText, BarChart3, Home } from 'lucide-react';

export const SolutionsSection: React.FC = () => {
  return (
    <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header with pill and centered headline */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <PillBadge dotColor="#2F6BFF" className="mb-4">
          Solutions
        </PillBadge>
        <h2 className="text-[34px] sm:text-[46px] lg:text-[50px] font-medium text-[#0B0B0C] tracking-tight leading-[1.12]">
          Solve your shop's biggest challenges
        </h2>
      </div>

      {/* 3-Column Feature Row with dividers and connection dots */}
      <div className="relative mb-20">
        {/* Top border line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-black/[0.08]" />
        
        {/* Connection dots */}
        <div className="absolute -top-[4px] left-[0%] w-2 h-2 rounded-full bg-white border border-black/[0.2] shadow-sm z-10" />
        <div className="hidden md:block absolute -top-[4px] left-[33.33%] w-2 h-2 rounded-full bg-white border border-black/[0.2] shadow-sm z-10" />
        <div className="hidden md:block absolute -top-[4px] left-[66.66%] w-2 h-2 rounded-full bg-white border border-black/[0.2] shadow-sm z-10" />
        <div className="absolute -top-[4px] right-[0%] w-2 h-2 rounded-full bg-white border border-black/[0.2] shadow-sm z-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/[0.08] pt-10 pb-8">
          
          {/* Column 1 */}
          <div className="px-6 lg:px-10 py-4 flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-5">
              <Compass className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-[19px] sm:text-[21px] font-medium text-[#0B0B0C] leading-snug">
              Know which customers need attention, without guessing.
            </p>
            <p className="mt-3 text-[15px] text-[#6E6E73] leading-relaxed">
              Automatic clustering finds dormant regulars, fresh arrivals, and top tea connoisseurs instantly.
            </p>
          </div>

          {/* Column 2 */}
          <div className="px-6 lg:px-10 py-4 flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-5">
              <Lightbulb className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-[19px] sm:text-[21px] font-medium text-[#0B0B0C] leading-snug">
              Get one clear action at a time, with a reason you can read.
            </p>
            <p className="mt-3 text-[15px] text-[#6E6E73] leading-relaxed">
              No black-box math. See exactly why a Bun Maska win-back was recommended and its signal weights.
            </p>
          </div>

          {/* Column 3 */}
          <div className="px-6 lg:px-10 py-4 flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-5">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-[19px] sm:text-[21px] font-medium text-[#0B0B0C] leading-snug">
              Respect every customer's choice automatically.
            </p>
            <p className="mt-3 text-[15px] text-[#6E6E73] leading-relaxed">
              Opted-out customers smoothly fall back to non-personalised menu specials. Zero compliance headaches.
            </p>
          </div>

        </div>
      </div>

      {/* Cyan Gradient Panel containing Dashboard Mockup */}
      <div className="relative rounded-[32px] sm:rounded-[36px] bg-cyan-gradient p-5 sm:p-8 lg:p-12 shadow-[0_20px_50px_rgba(30,192,255,0.25)]">
        
        {/* Floating Green Check Tile Overlapping Right Edge */}
        <div
          className="absolute -top-6 -right-3 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-[#1EC7A0] text-white shadow-[0_14px_30px_rgba(30,199,160,0.4)] flex items-center justify-center rotate-8 z-20 animate-gentle-float"
          style={{ '--tw-rotate': '8deg' } as React.CSSProperties}
          aria-hidden="true"
        >
          <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </div>

        {/* Inner Mockup Container */}
        <div className="rounded-[24px] sm:rounded-[28px] bg-[#F6F6F7] border border-black/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.1)] overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            
            {/* Sidebar Mockup */}
            <div className="lg:col-span-3 bg-white border-r border-black/[0.06] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-8 px-2">
                  <div className="w-6 h-6 rounded-lg bg-[#2F6BFF] flex items-center justify-center text-white">
                    <span className="text-xs font-bold">N</span>
                  </div>
                  <span className="font-semibold text-sm text-[#0B0B0C]">Nova Insights</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-3 py-2 rounded-[12px] bg-[#F1F1F2] text-[#0B0B0C] font-medium text-xs">
                    <div className="flex items-center gap-2.5">
                      <Home className="w-3.5 h-3.5 text-[#2F6BFF]" />
                      <span>Home</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[12px] text-[#6E6E73] hover:text-[#0B0B0C] font-medium text-xs">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Segments</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F1F1F2] text-[#3A3A3D]">4</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[12px] text-[#6E6E73] hover:text-[#0B0B0C] font-medium text-xs">
                    <div className="flex items-center gap-2.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>Actions</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF] font-semibold">6</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[12px] text-[#6E6E73] hover:text-[#0B0B0C] font-medium text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tasks</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F1F1F2] text-[#3A3A3D]">5</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[12px] text-[#6E6E73] hover:text-[#0B0B0C] font-medium text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Consent log</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-[12px] text-[#6E6E73] hover:text-[#0B0B0C] font-medium text-xs">
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Impact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cafe indicator */}
              <div className="p-3 rounded-[14px] bg-[#F9F9FA] border border-black/[0.04]">
                <div className="text-[11px] font-semibold text-[#0B0B0C]">Chai & Co (Flagship)</div>
                <div className="text-[10px] text-[#22C55E] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Privacy shield active
                </div>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="lg:col-span-9 p-6 lg:p-8 bg-[#F6F6F7] flex flex-col justify-between">
              
              {/* Header Greeting */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.05]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight">
                    <span className="text-[#9A9A9E]">Good morning, </span>
                    <span className="text-[#0B0B0C] font-semibold">Amanda</span>
                  </h3>
                  <p className="text-xs text-[#6E6E73] mt-0.5">
                    Here is what Chai & Co should focus on today.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#1EC7A0]/15 text-[#0F8A6D] text-xs font-medium">
                    Demo Mode
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#2F6BFF] text-white flex items-center justify-center font-semibold text-xs">
                    A
                  </div>
                </div>
              </div>

              {/* 3 Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Widget 1: To do list */}
                <div className="bg-white rounded-[20px] p-4 border border-black/[0.06] shadow-sm text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                      To do list
                    </span>
                    <span className="text-[11px] font-medium text-[#2F6BFF] tabular-nums">2 of 5</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-[#9A9A9E] line-through">
                      <div className="w-4 h-4 rounded-md bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="truncate">Send weekend offer</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#9A9A9E] line-through">
                      <div className="w-4 h-4 rounded-md bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="truncate">Trigger welcome stamps</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#0B0B0C] font-medium">
                      <div className="w-4 h-4 rounded-md border border-black/[0.2] shrink-0" />
                      <span className="truncate">Dispatch VIP invitation</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#0B0B0C] font-medium">
                      <div className="w-4 h-4 rounded-md border border-black/[0.2] shrink-0" />
                      <span className="truncate">Afternoon savory roll pairing</span>
                    </div>
                  </div>
                </div>

                {/* Widget 2: Customers reached */}
                <div className="bg-white rounded-[20px] p-4 border border-black/[0.06] shadow-sm flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                        Customers reached
                      </span>
                      <span className="text-[11px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
                        +18%
                      </span>
                    </div>
                    <div className="text-3xl font-semibold text-[#0B0B0C] tabular-nums tracking-tight">
                      128
                    </div>
                    <div className="text-xs text-[#6E6E73] mt-1">
                      this week across consented channels
                    </div>
                  </div>
                  <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-[11px]">
                    <span className="text-[#6E6E73]">Zero spam rate</span>
                    <span className="text-[#0B0B0C] font-medium">99.4% delivery</span>
                  </div>
                </div>

                {/* Widget 3: Activity Concentric Rings */}
                <div className="bg-white rounded-[20px] p-4 border border-black/[0.06] shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                        Activity
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </div>
                    <div className="flex items-center gap-4 py-1">
                      {/* Concentric rings SVG representation */}
                      <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0 -rotate-90">
                        {/* Outer track */}
                        <circle cx="34" cy="34" r="28" stroke="#F1F1F2" strokeWidth="6" fill="none" />
                        {/* Outer cyan ring: Consented 78% */}
                        <circle
                          cx="34"
                          cy="34"
                          r="28"
                          stroke="#1EC0FF"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={175.9}
                          strokeDashoffset={175.9 * (1 - 0.78)}
                          strokeLinecap="round"
                        />
                        {/* Inner track */}
                        <circle cx="34" cy="34" r="18" stroke="#F1F1F2" strokeWidth="5" fill="none" />
                        {/* Inner orange ring: Actions done 8/12 = 66% */}
                        <circle
                          cx="34"
                          cy="34"
                          r="18"
                          stroke="#F59E0B"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray={113.1}
                          strokeDashoffset={113.1 * (1 - 0.66)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1EC0FF]" />
                          <span className="text-[#3A3A3D]">Consented: <b className="text-[#0B0B0C] tabular-nums">78%</b></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                          <span className="text-[#3A3A3D]">Actions: <b className="text-[#0B0B0C] tabular-nums">8/12</b></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#6E6E73] pt-2 border-t border-black/[0.05]">
                    Updated real-time with consent audits
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
