import React, { useState } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { ActionCategory } from '../../types';
import { useNavigate } from 'react-router-dom';
import { getExcludedCountForAction } from '../../lib/segmentation';
import {
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare,
  Smartphone,
  Mail,
  Share2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const ActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { actions, customers } = useNovaStore();
  const [selectedCategory, setSelectedCategory] = useState<'All' | ActionCategory>('All');

  const categories: ('All' | ActionCategory)[] = [
    'All',
    'Win-back',
    'Welcome',
    'Loyalty',
    'Upsell',
    'Weekend special',
    'Feedback',
  ];

  const filteredActions = actions.filter((act) => {
    if (selectedCategory === 'All') return true;
    return act.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Explainable next best actions
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Transparent suggestions. Every action lists its signal weights and privacy bounds.
          </p>
        </div>

        <div className="text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2F6BFF]" />
          <span>Active recommendations: <b className="text-[#0B0B0C] tabular-nums">{actions.length}</b></span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`h-9 px-4 rounded-[12px] text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0B0B0C] text-white shadow-xs'
                : 'bg-white border border-black/[0.08] text-[#6E6E73] hover:text-[#0B0B0C]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActions.map((action) => {
          const excluded = getExcludedCountForAction(customers, action.segmentId);
          return (
            <div
              key={action.id}
              className={`rounded-[28px] bg-white border p-6 flex flex-col justify-between transition-all shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] ${
                action.isCompleted
                  ? 'border-[#22C55E]/40 bg-[#F0FDF4]/30'
                  : 'border-black/[0.08]'
              }`}
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F1F2] text-[#3A3A3D]">
                    {action.segmentName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {action.isCompleted && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#16A34A] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1EC0FF]/15 text-[#0070A3] tabular-nums">
                      {action.confidence}% confidence
                    </span>
                  </div>
                </div>

                <h2 className="text-base font-semibold text-[#0B0B0C] leading-snug mb-2">
                  {action.title}
                </h2>

                <p className="text-xs text-[#6E6E73] leading-relaxed mb-4 line-clamp-3">
                  {action.reason}
                </p>

                {/* Expected impact & effort */}
                <div className="p-3.5 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6E73]">Expected return:</span>
                    <span className="font-semibold text-[#22C55E]">{action.expectedResult}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6E73]">Staff effort:</span>
                    <span className="font-medium text-[#0B0B0C]">{action.effort}</span>
                  </div>
                  {excluded > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] text-[11px] text-[#F59E0B]">
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Excluded by privacy:
                      </span>
                      <span className="font-semibold tabular-nums">{excluded} patrons</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer */}
              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {action.channel === 'whatsapp' && (
                    <div className="w-7 h-7 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center" title="WhatsApp">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {action.channel === 'sms' && (
                    <div className="w-7 h-7 rounded-full bg-[#2F6BFF]/15 text-[#2F6BFF] flex items-center justify-center" title="SMS">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {action.channel === 'email' && (
                    <div className="w-7 h-7 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center" title="Email">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {action.channel === 'omnichannel' && (
                    <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center" title="Omnichannel">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="text-[11px] text-[#6E6E73] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="tabular-nums">{action.dueTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/app/actions/${action.id}`)}
                  className="h-9 px-4 rounded-[10px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>View action</span>
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
