import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { getExcludedCountForAction } from '../../lib/segmentation';
import { getPrivacySummaryBadge, formatContributionTooltip } from '../../lib/explain';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  MessageSquare,
  Smartphone,
  Mail,
  Info
} from 'lucide-react';

export const ActionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { actions, customers, markActionDone } = useNovaStore();

  const action = actions.find((a) => a.id === id) || actions[0];
  const excludedCount = getExcludedCountForAction(customers, action.segmentId);
  const privacyBadges = getPrivacySummaryBadge(action);

  // Message template editor tab state
  const [activeChannelTab, setActiveChannelTab] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [messageDraft, setMessageDraft] = useState(action.templateMessage[activeChannelTab]);
  const [copiedToast, setCopiedToast] = useState(false);
  const [markedDoneToast, setMarkedDoneToast] = useState(false);

  const handleChannelTabChange = (tab: 'whatsapp' | 'sms' | 'email') => {
    setActiveChannelTab(tab);
    setMessageDraft(action.templateMessage[tab]);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageDraft);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleMarkDone = () => {
    markActionDone(action.id);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#2F6BFF', '#1EC7A0', '#F59E0B'],
    });
    setMarkedDoneToast(true);
    setTimeout(() => setMarkedDoneToast(false), 3000);
  };

  const insertVariable = (variable: string) => {
    setMessageDraft((prev) => `${prev} ${variable}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/app/actions')}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#0B0B0C] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to actions</span>
      </button>

      {/* Main Action Header Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F1F2] text-[#3A3A3D]">
                Target: {action.segmentName}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1EC0FF]/15 text-[#0070A3] tabular-nums">
                {action.confidence}% confidence
              </span>
              {action.isCompleted && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#16A34A] flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Completed
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B0B0C] tracking-tight">
              {action.title}
            </h1>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleCopyMessage}
              className="flex-1 lg:flex-none h-11 px-5 rounded-[12px] bg-white border border-black/[0.12] hover:bg-[#F9F9FA] text-xs font-medium text-[#0B0B0C] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>Copy message</span>
            </button>
            <button
              onClick={handleMarkDone}
              disabled={action.isCompleted}
              className={`flex-1 lg:flex-none h-11 px-6 rounded-[12px] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                action.isCompleted
                  ? 'bg-[#22C55E] text-white cursor-default'
                  : 'bg-[#2F6BFF] hover:bg-[#1F58E6] text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{action.isCompleted ? 'Done' : 'Mark as done'}</span>
            </button>
          </div>
        </div>

        {/* Privacy summary banner */}
        <div className="p-4 rounded-[18px] bg-[#F9F9FA] border border-black/[0.05] space-y-2 text-xs">
          <div className="flex items-start gap-2 text-[#16A34A]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{privacyBadges.dataUsedText}</span>
          </div>
          <div className="flex items-start gap-2 text-[#6E6E73]">
            <span className="w-4 h-4 rounded-full bg-black/10 text-[#0B0B0C] flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
            <span>{privacyBadges.dataNotUsedText}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Explainability & Contribution Bars vs Template Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: "Why this?" & Contribution Bars (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* "Why this?" Card */}
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                <Lightbulb className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-lg font-semibold text-[#0B0B0C]">
                Why was this recommended?
              </h2>
            </div>
            <p className="text-sm text-[#3A3A3D] leading-relaxed">
              {action.reason}
            </p>

            <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#6E6E73]">Projected business uplift:</span>
              <span className="font-semibold text-[#22C55E]">{action.expectedResult}</span>
            </div>
          </div>

          {/* Feature Contribution Bars (Cyan bars) */}
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">
                Feature contribution weights
              </h2>
              <span className="text-xs font-semibold text-[#2F6BFF] bg-[#2F6BFF]/10 px-2.5 py-0.5 rounded-full">
                Cyan signals
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mb-6">
              Exact signal attribution. Hover over any bar to inspect mathematical weight.
            </p>

            <div className="space-y-4">
              {action.featureContributions.map((feat, idx) => (
                <div key={idx} className="group relative">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#0B0B0C] font-medium flex items-center gap-1.5">
                      <span>{feat.name}</span>
                      <Info className="w-3 h-3 text-[#9A9A9E] cursor-help" />
                    </span>
                    <span className="font-semibold text-[#0B0B0C] tabular-nums">
                      {feat.weight}%
                    </span>
                  </div>

                  {/* Cyan Bar */}
                  <div className="w-full bg-[#E5E5EA] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1EC0FF] transition-all duration-500"
                      style={{ width: `${feat.weight}%` }}
                    />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute left-0 -top-10 bg-[#0B0B0C] text-white text-[11px] p-2 rounded-[8px] z-20 shadow-lg max-w-sm">
                    {formatContributionTooltip(feat.name, feat.weight, feat.explanation)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consent Check Card */}
          <div className="rounded-[24px] bg-[#FFFBEB] border border-[#F59E0B]/30 p-5 text-xs text-[#3A3A3D]">
            <div className="flex items-center gap-2 text-[#B45309] font-semibold mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Automated Consent Check</span>
            </div>
            <p className="leading-relaxed">
              {excludedCount > 0 ? (
                <>
                  <b>{excludedCount} customers</b> matched the behavioral segment but were safely excluded because their privacy settings forbid this channel or purpose.
                </>
              ) : (
                <>
                  100% of candidate patrons have active consent for this action. Zero compliance friction.
                </>
              )}
            </p>
          </div>

        </div>

        {/* Right Column: Message Template Editor (lg:col-span-6) */}
        <div className="lg:col-span-6 rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-6">
          
          <div>
            <h2 className="text-lg font-semibold text-[#0B0B0C] mb-1">
              Dispatch message editor
            </h2>
            <p className="text-xs text-[#6E6E73]">
              Personalized fields are automatically swapped per recipient at time of transmission.
            </p>
          </div>

          {/* Channel Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-[14px] bg-[#F1F1F2]">
            <button
              onClick={() => handleChannelTabChange('whatsapp')}
              className={`flex-1 py-2 rounded-[10px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChannelTab === 'whatsapp'
                  ? 'bg-white text-[#0B0B0C] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#0B0B0C]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleChannelTabChange('sms')}
              className={`flex-1 py-2 rounded-[10px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChannelTab === 'sms'
                  ? 'bg-white text-[#0B0B0C] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#0B0B0C]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#2F6BFF]" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => handleChannelTabChange('email')}
              className={`flex-1 py-2 rounded-[10px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChannelTab === 'email'
                  ? 'bg-white text-[#0B0B0C] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#0B0B0C]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Email</span>
            </button>
          </div>

          {/* Variable chips */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] block mb-2">
              Click to insert variable chip:
            </span>
            <div className="flex flex-wrap gap-2">
              {['{first_name}', '{favourite_item}', '{cafe_name}', '{offer_code}'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => insertVariable(chip)}
                  className="px-2.5 py-1 rounded-[8px] bg-[#F6F6F7] hover:bg-[#E5E5EA] border border-black/[0.08] text-xs font-mono text-[#2F6BFF] transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              rows={7}
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              className="w-full p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.1] focus:bg-white focus:border-[#2F6BFF] text-xs text-[#0B0B0C] outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-[#6E6E73] mt-2">
              <span>Variables will resolve to recipient's consented attributes</span>
              <span className="tabular-nums font-mono">{messageDraft.length} characters</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopyMessage}
              className="flex-1 h-11 rounded-[12px] bg-[#0B0B0C] hover:bg-[#2F6BFF] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy formatted message</span>
            </button>
          </div>

        </div>

      </div>

      {/* Floating toasts */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 bg-[#0B0B0C] text-white px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>Message template copied to clipboard!</span>
        </div>
      )}

      {markedDoneToast && (
        <div className="fixed bottom-6 right-6 bg-[#22C55E] text-white px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 z-50">
          <Sparkles className="w-4 h-4" />
          <span>Action marked as completed! Tasks updated.</span>
        </div>
      )}

    </div>
  );
};
