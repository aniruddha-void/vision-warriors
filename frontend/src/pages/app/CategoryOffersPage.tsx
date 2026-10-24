import React from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { categoryOfferConfigs, getCategoryBreakdown, evaluateOfferEligibility } from '../../lib/segmentation';
import { CustomerCategory } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, ShieldAlert, Gift, Tag, Clock } from 'lucide-react';

export const CategoryOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, categoryThresholds } = useNovaStore();
  const breakdown = getCategoryBreakdown(customers, categoryThresholds);

  const categories: CustomerCategory[] = ['NEW', 'REGULAR', 'IRREGULAR'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Discount offers by customer category
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Targeted promotions triggered automatically by customer attendance tier.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Consent gate active: 0 spam guarantee</span>
        </div>
      </div>

      {/* 3 Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const config = categoryOfferConfigs[cat];
          const members =
            cat === 'NEW'
              ? breakdown.newCustomers
              : cat === 'REGULAR'
              ? breakdown.regularCustomers
              : breakdown.irregularCustomers;

          // Count eligible vs excluded for default channel (whatsapp/sms)
          let eligibleCount = 0;
          let excludedCount = 0;

          members.forEach(({ customer }) => {
            const check = evaluateOfferEligibility(customer, cat, customer.preferredChannel, categoryThresholds);
            if (check.eligible) eligibleCount++;
            else excludedCount++;
          });

          return (
            <div
              key={cat}
              className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-7 shadow-[0_4px_18px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all"
            >
              <div>
                {/* Category Chip */}
                <div className="flex items-center justify-between mb-4">
                  {cat === 'NEW' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E6EEFF] text-[#2F6BFF]">
                      New Customers ({members.length})
                    </span>
                  )}
                  {cat === 'REGULAR' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E3F6EA] text-[#16A34A]">
                      Regular Patrons ({members.length})
                    </span>
                  )}
                  {cat === 'IRREGULAR' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF0D6] text-[#D97706]">
                      Irregular / At-Risk ({members.length})
                    </span>
                  )}

                  <span className="text-xs font-semibold text-[#2F6BFF] bg-[#2F6BFF]/10 px-2.5 py-0.5 rounded-full">
                    {config.discountText}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#0B0B0C] mb-2 leading-snug">
                  {config.headline}
                </h2>

                <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                  {config.suggestedOffer}
                </p>

                {/* Eligibility Pill Box */}
                <div className="p-4 rounded-[18px] bg-[#F9F9FA] border border-black/[0.04] space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6E73] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Consented & ready:
                    </span>
                    <span className="font-bold text-[#16A34A] tabular-nums">{eligibleCount} patrons</span>
                  </div>

                  <div className="flex items-center justify-between text-[#B45309]">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Excluded (no consent/channel):
                    </span>
                    <span className="font-bold tabular-nums">{excludedCount} patrons</span>
                  </div>

                  <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#6E6E73]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {config.validity}
                    </span>
                    <span>100% explainable</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-black/[0.06]">
                <button
                  onClick={() => navigate(`/app/offers/${cat.toLowerCase()}`)}
                  className="w-full h-11 rounded-[12px] bg-[#0B0B0C] hover:bg-[#2F6BFF] text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Tag className="w-4 h-4" />
                  <span>Review and send offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
