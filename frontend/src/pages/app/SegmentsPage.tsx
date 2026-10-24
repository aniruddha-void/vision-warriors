import React from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { segmentDefinitions } from '../../data/segments';
import { getSegmentMembers } from '../../lib/segmentation';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const SegmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = useNovaStore();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Customer segments
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Dynamic patron groupings. Automatically excludes customers who withdrew relevant consent.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>4 Active Segments</span>
        </div>
      </div>

      {/* Segments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segmentDefinitions.map((segment) => {
          const result = getSegmentMembers(customers, segment.id);
          const eligibleCount = result.eligibleCustomers.length;
          const excludedCount = result.excludedCustomers.length;
          const totalMatching = eligibleCount + excludedCount;
          const coveragePct = totalMatching > 0 ? Math.round((eligibleCount / totalMatching) * 100) : 100;

          return (
            <div
              key={segment.id}
              className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <h2 className="text-xl font-semibold text-[#0B0B0C]">
                      {segment.name}
                    </h2>
                  </div>
                  <span className="text-sm font-bold text-[#0B0B0C] bg-[#F1F1F2] px-3 py-1 rounded-full tabular-nums">
                    {eligibleCount} eligible
                  </span>
                </div>

                <p className="text-sm text-[#3A3A3D] mb-4">
                  {segment.description}
                </p>

                {/* Plain Words Rule */}
                <div className="p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] block mb-1">
                    Plain-language rule
                  </span>
                  <span className="text-xs text-[#0B0B0C] font-medium leading-relaxed">
                    "{segment.ruleDescription}"
                  </span>
                </div>

                {/* Consent Coverage Bar */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E6E73]">Consent coverage</span>
                    <span className="font-semibold text-[#0B0B0C] tabular-nums">
                      {coveragePct}% ({eligibleCount} of {totalMatching})
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F1F2] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${coveragePct}%`,
                        backgroundColor: coveragePct > 70 ? '#22C55E' : '#F59E0B',
                      }}
                    />
                  </div>
                  {excludedCount > 0 && (
                    <div className="text-[11px] text-[#F59E0B] flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{excludedCount} patrons match rule but are hidden due to privacy consent.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <span className="text-xs text-[#6E6E73]">
                  Required: {segment.requiredConsent.join(', ')}
                </span>
                <button
                  onClick={() => navigate(`/app/segments/${segment.id}`)}
                  className="h-9 px-4 rounded-[10px] bg-[#0B0B0C] hover:bg-[#2F6BFF] text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Inspect patrons</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
