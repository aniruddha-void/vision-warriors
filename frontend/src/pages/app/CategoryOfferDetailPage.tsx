import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { categoryOfferConfigs, evaluateOfferEligibility } from '../../lib/segmentation';
import { CustomerCategory } from '../../types';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  MessageSquare,
  Smartphone,
  Mail,
  Copy,
  Check,
  Info,
  Clock
} from 'lucide-react';

export const CategoryOfferDetailPage: React.FC = () => {
  const { category: rawCategory } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { customers, categoryThresholds, sendCategoryOffer } = useNovaStore();

  const normalizedCategory = (rawCategory?.toUpperCase() || 'NEW') as CustomerCategory;
  const config = categoryOfferConfigs[normalizedCategory] || categoryOfferConfigs.NEW;

  // Active channel tab
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [messageDraft, setMessageDraft] = useState(config.templateMessage[activeChannel]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [sendToast, setSendToast] = useState<{ open: boolean; sentCount: number; excludedCount: number }>({
    open: false,
    sentCount: 0,
    excludedCount: 0,
  });

  const handleChannelChange = (ch: 'whatsapp' | 'sms' | 'email') => {
    setActiveChannel(ch);
    setMessageDraft(config.templateMessage[ch]);
  };

  const insertChip = (chip: string) => {
    setMessageDraft((prev) => `${prev} ${chip}`);
  };

  // Calculate live eligible vs excluded for this category and channel
  let eligibleCount = 0;
  let excludedCount = 0;

  customers.forEach((c) => {
    const res = evaluateOfferEligibility(c, normalizedCategory, activeChannel, categoryThresholds);
    if (res.eligible) eligibleCount++;
    else {
      if (c.category === normalizedCategory) excludedCount++;
    }
  });

  const handleExecuteSend = () => {
    const res = sendCategoryOffer(normalizedCategory, activeChannel, messageDraft);
    setShowPreviewModal(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2F6BFF', '#1EC7A0', '#F59E0B'],
    });

    setSendToast({
      open: true,
      sentCount: res.sentCount,
      excludedCount: res.excludedCount,
    });
    setTimeout(() => setSendToast({ open: false, sentCount: 0, excludedCount: 0 }), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Back link */}
      <button
        onClick={() => navigate('/app/offers')}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#0B0B0C] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to category offers</span>
      </button>

      {/* Main Header Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {normalizedCategory === 'NEW' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E6EEFF] text-[#2F6BFF]">
                New Category
              </span>
            )}
            {normalizedCategory === 'REGULAR' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E3F6EA] text-[#16A34A]">
                Regulars Category
              </span>
            )}
            {normalizedCategory === 'IRREGULAR' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF0D6] text-[#D97706]">
                Irregular Category
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B0B0C]">
              {config.headline}
            </h1>
          </div>

          <button
            onClick={() => setShowPreviewModal(true)}
            disabled={eligibleCount === 0}
            className={`h-11 px-6 rounded-[12px] font-medium text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
              eligibleCount > 0
                ? 'bg-[#2F6BFF] hover:bg-[#1F58E6] text-white'
                : 'bg-[#D1D1D6] text-white cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send to {eligibleCount} patrons</span>
          </button>
        </div>

        <p className="text-sm text-[#6E6E73] mb-6 max-w-2xl">
          {config.suggestedOffer} &bull; {config.validity}
        </p>

        {/* Privacy Badge */}
        <div className="p-4 rounded-[18px] bg-[#F9F9FA] border border-black/[0.04] text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-[#16A34A] font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Data used: {config.dataUsed.join(', ')} (consent given).</span>
          </div>
          <div className="flex items-center gap-2 text-[#6E6E73]">
            <span className="w-4 h-4 rounded-full bg-black/10 text-[#0B0B0C] flex items-center justify-center text-[10px] shrink-0 font-bold">✕</span>
            <span>Data NOT used: {config.dataNotUsed.join(', ')}.</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Explainability & Contribution Bars vs Template Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* "Why this?" Card */}
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                <Lightbulb className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-lg font-semibold text-[#0B0B0C]">
                Why this category offer?
              </h2>
            </div>
            <p className="text-sm text-[#3A3A3D] leading-relaxed">
              {config.reason}
            </p>
          </div>

          {/* Cyan Feature Contribution Bars */}
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">
                Signal contribution bars
              </h2>
              <span className="text-xs font-semibold text-[#2F6BFF] bg-[#2F6BFF]/10 px-2.5 py-0.5 rounded-full">
                Cyan weights
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mb-5">
              Factors used to qualify patrons for this discount without invasive surveillance.
            </p>

            <div className="space-y-4">
              {config.featureContributions.map((feat, idx) => (
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

                  <div className="w-full bg-[#E5E5EA] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1EC0FF] transition-all duration-500"
                      style={{ width: `${feat.weight}%` }}
                    />
                  </div>

                  <div className="hidden group-hover:block absolute left-0 -top-8 bg-[#0B0B0C] text-white text-[11px] p-2 rounded-[8px] z-20 shadow-lg max-w-sm">
                    {feat.name}: {feat.weight}% influence. {feat.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consent Check Gate Box */}
          <div className="rounded-[24px] bg-[#FFFBEB] border border-[#F59E0B]/30 p-5 text-xs text-[#3A3A3D]">
            <div className="flex items-center gap-2 text-[#B45309] font-semibold mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Automated Consent Gate</span>
            </div>
            <p className="leading-relaxed">
              <b>{eligibleCount} patrons</b> are consented to receive {activeChannel.toUpperCase()} updates.
              <b> {excludedCount} patrons</b> are excluded because their privacy settings forbid this channel or master consent is off.
            </p>
          </div>

        </div>

        {/* Right Column: Template Editor (lg:col-span-6) */}
        <div className="lg:col-span-6 rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0B0B0C] mb-1">
              Message template editor
            </h2>
            <p className="text-xs text-[#6E6E73]">
              Personalized chips resolve at delivery for consented recipients only.
            </p>
          </div>

          {/* Channel Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-[14px] bg-[#F1F1F2]">
            <button
              onClick={() => handleChannelChange('whatsapp')}
              className={`flex-1 py-2 rounded-[10px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChannel === 'whatsapp' ? 'bg-white text-[#0B0B0C] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleChannelChange('sms')}
              className={`flex-1 py-2 rounded-[10px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChannel === 'sms' ? 'bg-white text-[#0B0B0C] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#2F6BFF]" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => handleChannelChange('email')}
              className={`flex-1 py-2 rounded-[10px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChannel === 'email' ? 'bg-white text-[#0B0B0C] shadow-xs' : 'text-[#6E6E73]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Email</span>
            </button>
          </div>

          {/* Chip inserters */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] block mb-2">
              Insert variable chip:
            </span>
            <div className="flex flex-wrap gap-2">
              {['{first_name}', '{discount}', '{valid_till}'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => insertChip(chip)}
                  className="px-2.5 py-1 rounded-[8px] bg-[#F6F6F7] hover:bg-[#E5E5EA] border border-black/[0.08] text-xs font-mono text-[#2F6BFF] transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Draft editor */}
          <div>
            <textarea
              rows={7}
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              className="w-full p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.1] focus:bg-white focus:border-[#2F6BFF] text-xs text-[#0B0B0C] outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-[#6E6E73] mt-2">
              <span>Channel: <b className="capitalize text-[#0B0B0C]">{activeChannel}</b></span>
              <span className="tabular-nums font-mono">{messageDraft.length} characters</span>
            </div>
          </div>

          {/* Review and Send trigger */}
          <div className="pt-2">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="w-full h-11 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Preview & simulated send</span>
            </button>
          </div>

        </div>

      </div>

      {/* Simulated Send Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 border border-black/[0.08] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2F6BFF] bg-[#2F6BFF]/10 px-3 py-1 rounded-full">
                Simulated Transmission Preview
              </span>
              <span className="text-xs text-[#6E6E73] capitalize">Via {activeChannel}</span>
            </div>

            <h3 className="text-xl font-bold text-[#0B0B0C] mb-2">
              Confirm {normalizedCategory} Category Send
            </h3>

            <p className="text-xs text-[#6E6E73] mb-4">
              This simulated action will create {eligibleCount} customer offer records and write an audit event.
            </p>

            <div className="p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.06] text-xs text-[#0B0B0C] mb-6 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {messageDraft
                .replace('{first_name}', 'Aarav')
                .replace('{discount}', config.discountText)
                .replace('{valid_till}', 'Sunday')}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 h-11 rounded-[12px] bg-[#F1F1F2] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSend}
                className="flex-1 h-11 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm simulated send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {sendToast.open && (
        <div className="fixed bottom-6 right-6 bg-[#0B0B0C] text-white px-5 py-3.5 rounded-full text-xs font-medium shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#22C55E]" />
          <span>
            <b>Simulated send complete!</b> Delivered to {sendToast.sentCount} patrons ({sendToast.excludedCount} excluded by consent gate).
          </span>
        </div>
      )}

    </div>
  );
};
