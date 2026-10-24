import React from 'react';
import { PillBadge } from '../ui/PillBadge';
import { Sparkles, Users, ToggleLeft, ToggleRight, Gift } from 'lucide-react';

export const FeaturesBento: React.FC = () => {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <PillBadge dotColor="#1EC0FF" className="mb-4">
          Features
        </PillBadge>
        <h2 className="text-[34px] sm:text-[46px] lg:text-[50px] font-medium text-[#0B0B0C] tracking-tight leading-[1.12]">
          Keep everything in one place
        </h2>
        <p className="mt-4 text-[17px] text-[#6E6E73] font-normal">
          Forget complex analytics tools. Get plain English insights designed for busy shop owners.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        
        {/* Bento Card 1: Smart segments (span 3) */}
        <div className="md:col-span-3 rounded-[28px] bg-white border border-black/[0.07] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)] transition-all">
          {/* Mini floating UI on top */}
          <div className="rounded-[20px] bg-[#F6F6F7] p-5 mb-8 border border-black/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2F6BFF]" /> Active segments
              </span>
              <span className="text-xs font-medium text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
                Auto-synced
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-[14px] border border-black/[0.04] shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F6BFF]" />
                  <span className="text-sm font-medium text-[#0B0B0C]">Regulars</span>
                </div>
                <span className="text-xs font-semibold text-[#3A3A3D] tabular-nums">24 customers</span>
              </div>
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-[14px] border border-black/[0.04] shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-sm font-medium text-[#0B0B0C]">At-risk patrons</span>
                </div>
                <span className="text-xs font-semibold text-[#F59E0B] tabular-nums">12 customers</span>
              </div>
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-[14px] border border-black/[0.04] shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1EC7A0]" />
                  <span className="text-sm font-medium text-[#0B0B0C]">New arrivals</span>
                </div>
                <span className="text-xs font-semibold text-[#3A3A3D] tabular-nums">8 customers</span>
              </div>
            </div>
          </div>

          {/* Title & description below */}
          <div>
            <h3 className="text-[22px] font-semibold text-[#0B0B0C] tracking-tight mb-2">
              Smart segments
            </h3>
            <p className="text-[15px] text-[#6E6E73] leading-relaxed">
              See who your regulars, new and at-risk customers are in one glance.
            </p>
          </div>
        </div>

        {/* Bento Card 2: Explainable actions (span 3) */}
        <div className="md:col-span-3 rounded-[28px] bg-white border border-black/[0.07] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)] transition-all">
          {/* Mini UI: Bar chart with cyan bars + confidence chip */}
          <div className="rounded-[20px] bg-[#F6F6F7] p-5 mb-8 border border-black/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                Signal contribution
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1EC0FF]/15 text-[#0070A3] text-xs font-semibold tabular-nums">
                <Sparkles className="w-3 h-3" /> Confidence 75%
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3A3A3D] font-medium">Recency gap (21+ days)</span>
                  <span className="font-semibold text-[#0B0B0C] tabular-nums">45%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E5EA] overflow-hidden">
                  <div className="h-full rounded-full bg-[#1EC0FF]" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3A3A3D] font-medium">Historical frequency</span>
                  <span className="font-semibold text-[#0B0B0C] tabular-nums">28%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E5EA] overflow-hidden">
                  <div className="h-full rounded-full bg-[#1EC0FF]" style={{ width: '28%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3A3A3D] font-medium">Favorite order affinity</span>
                  <span className="font-semibold text-[#0B0B0C] tabular-nums">18%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E5EA] overflow-hidden">
                  <div className="h-full rounded-full bg-[#1EC0FF]" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[22px] font-semibold text-[#0B0B0C] tracking-tight mb-2">
              Explainable actions
            </h3>
            <p className="text-[15px] text-[#6E6E73] leading-relaxed">
              Every suggestion shows why, with the factors behind it.
            </p>
          </div>
        </div>

        {/* Bento Card 3: Consent manager (span 4) */}
        <div className="md:col-span-4 rounded-[28px] bg-white border border-black/[0.07] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)] transition-all">
          {/* Mini UI: Three toggle rows */}
          <div className="rounded-[20px] bg-[#F6F6F7] p-5 mb-8 border border-black/[0.04]">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
              <span>Customer consent portal preview</span>
              <span className="text-[#22C55E]">Live preference</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-[16px] border border-black/[0.04]">
                <div>
                  <div className="text-sm font-medium text-[#0B0B0C]">Purchase history</div>
                  <div className="text-xs text-[#6E6E73]">Used to recommend beverage & snack pairings</div>
                </div>
                <div className="flex items-center gap-1.5 text-[#22C55E] font-medium text-xs">
                  <ToggleRight className="w-6 h-6 stroke-[1.5] text-[#22C55E]" />
                  <span>ON</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-[16px] border border-black/[0.04]">
                <div>
                  <div className="text-sm font-medium text-[#0B0B0C]">Visit frequency</div>
                  <div className="text-xs text-[#6E6E73]">Used to calculate loyalty milestones & visits</div>
                </div>
                <div className="flex items-center gap-1.5 text-[#22C55E] font-medium text-xs">
                  <ToggleRight className="w-6 h-6 stroke-[1.5] text-[#22C55E]" />
                  <span>ON</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-[16px] border border-black/[0.04]">
                <div>
                  <div className="text-sm font-medium text-[#0B0B0C]">Location tracking</div>
                  <div className="text-xs text-[#6E6E73]">GPS and physical proximity (never required)</div>
                </div>
                <div className="flex items-center gap-1.5 text-[#9A9A9E] font-medium text-xs">
                  <ToggleLeft className="w-6 h-6 stroke-[1.5] text-[#9A9A9E]" />
                  <span>OFF</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[22px] font-semibold text-[#0B0B0C] tracking-tight mb-2">
              Consent manager
            </h3>
            <p className="text-[15px] text-[#6E6E73] leading-relaxed">
              Customers decide what is used, and can change it any time.
            </p>
          </div>
        </div>

        {/* Bento Card 4: Fallback mode (span 2, dashed border and transparent background) */}
        <div className="md:col-span-2 rounded-[28px] bg-transparent border-2 border-dashed border-black/[0.18] p-8 flex flex-col justify-between hover:border-black/[0.3] transition-all">
          {/* Mini UI: Two mini cards, one yellow "Today's special" */}
          <div className="space-y-3 mb-8">
            <div className="rounded-[18px] bg-[#FFE96B] p-4 text-[#3B3200] shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1">
                <Gift className="w-3.5 h-3.5" /> Today's special
              </div>
              <div className="text-sm font-semibold">
                Cutting Chai + Samosa Duo
              </div>
              <div className="text-xs mt-1 text-[#3B3200]/80">
                General offer &bull; ₹120 flat
              </div>
            </div>

            <div className="rounded-[18px] bg-white p-3.5 border border-black/[0.06] shadow-sm text-left">
              <div className="text-[11px] font-medium text-[#6E6E73]">
                Monsoon Weekend Platter
              </div>
              <div className="text-xs font-semibold text-[#0B0B0C] mt-0.5">
                Anonymous crowd favorite
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[22px] font-semibold text-[#0B0B0C] tracking-tight mb-2">
              Fallback mode
            </h3>
            <p className="text-[15px] text-[#6E6E73] leading-relaxed">
              No consent? Everyone still sees useful offers.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
};
