import React, { useState } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { Shield, RotateCcw, Check, Sparkles, Building2, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    categoryThresholds,
    updateCategoryThresholds,
    resetToDefaults,
    businessName,
    ownerName,
  } = useNovaStore();

  const [dataMinimization, setDataMinimization] = useState(settings.dataMinimization);
  const [retentionPeriod, setRetentionPeriod] = useState(settings.retentionPeriodMonths);
  const [defaultChannel, setDefaultChannel] = useState(settings.defaultChannel);
  const [demoMode, setDemoMode] = useState(settings.demoMode);

  // Category thresholds local state
  const [newMaxVisits, setNewMaxVisits] = useState(categoryThresholds.newMaxVisits);
  const [regularMinVisits, setRegularMinVisits] = useState(categoryThresholds.regularMinVisits30Days);
  const [regularMaxDays, setRegularMaxDays] = useState(categoryThresholds.regularMaxLastVisitDays);
  const [irregularMinDays, setIrregularMinDays] = useState(categoryThresholds.irregularMinLastVisitDays);

  const [savedToast, setSavedToast] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  const handleSave = () => {
    updateSettings({
      dataMinimization,
      retentionPeriodMonths: retentionPeriod,
      defaultChannel,
      demoMode,
    });

    updateCategoryThresholds({
      newMaxVisits: Number(newMaxVisits),
      regularMinVisits30Days: Number(regularMinVisits),
      regularMaxLastVisitDays: Number(regularMaxDays),
      irregularMinLastVisitDays: Number(irregularMinDays),
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    resetToDefaults();
    setResetModal(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2F6BFF', '#1EC7A0'],
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Settings & classification thresholds
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Customize category rules (New, Regular, Irregular), privacy retention, and presentation modes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="h-10 px-6 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save preferences</span>
        </button>
      </div>

      {/* Category Classification Thresholds */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B0B0C]">
              Customer category thresholds
            </h2>
            <p className="text-xs text-[#6E6E73]">
              Configure visit count and recency limits that classify customers into categories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs pt-2">
          
          <div className="p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] space-y-2">
            <span className="font-semibold text-[#0B0B0C] block">
              NEW: Maximum visit count
            </span>
            <p className="text-[11px] text-[#6E6E73]">
              Customers with this many visits or fewer are categorized as NEW.
            </p>
            <input
              type="number"
              min={1}
              max={5}
              value={newMaxVisits}
              onChange={(e) => setNewMaxVisits(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-[10px] bg-white border border-black/[0.1] text-xs font-bold outline-none"
            />
          </div>

          <div className="p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] space-y-2">
            <span className="font-semibold text-[#0B0B0C] block">
              REGULAR: Minimum monthly visits
            </span>
            <p className="text-[11px] text-[#6E6E73]">
              Visits per month needed to qualify as a REGULAR patron.
            </p>
            <input
              type="number"
              min={2}
              max={15}
              value={regularMinVisits}
              onChange={(e) => setRegularMinVisits(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-[10px] bg-white border border-black/[0.1] text-xs font-bold outline-none"
            />
          </div>

          <div className="p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] space-y-2">
            <span className="font-semibold text-[#0B0B0C] block">
              REGULAR: Maximum days since last visit
            </span>
            <p className="text-[11px] text-[#6E6E73]">
              Patrons must have visited within these days to maintain Regular standing.
            </p>
            <input
              type="number"
              min={7}
              max={30}
              value={regularMaxDays}
              onChange={(e) => setRegularMaxDays(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-[10px] bg-white border border-black/[0.1] text-xs font-bold outline-none"
            />
          </div>

          <div className="p-4 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] space-y-2">
            <span className="font-semibold text-[#0B0B0C] block">
              IRREGULAR: Days gap to mark at-risk
            </span>
            <p className="text-[11px] text-[#6E6E73]">
              Patrons absent longer than this are classified as IRREGULAR for win-back.
            </p>
            <input
              type="number"
              min={14}
              max={60}
              value={irregularMinDays}
              onChange={(e) => setIrregularMinDays(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-[10px] bg-white border border-black/[0.1] text-xs font-bold outline-none"
            />
          </div>

        </div>
      </div>

      {/* Shop Profile Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B0B0C]">
              Shop identity & counter setup
            </h2>
            <p className="text-xs text-[#6E6E73]">
              Default store parameters used in customer templates and QR generation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#6E6E73] uppercase tracking-wider font-semibold mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              readOnly
              value={businessName}
              className="w-full h-10 px-3 rounded-[10px] bg-[#F9F9FA] border border-black/[0.08] text-[#0B0B0C] font-medium"
            />
          </div>
          <div>
            <label className="block text-[#6E6E73] uppercase tracking-wider font-semibold mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              readOnly
              value={ownerName}
              className="w-full h-10 px-3 rounded-[10px] bg-[#F9F9FA] border border-black/[0.08] text-[#0B0B0C] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Data Rules & Privacy Configuration */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B0B0C]">
              Data minimization & retention
            </h2>
            <p className="text-xs text-[#6E6E73]">
              Enforce strict DPDP and GDPR storage minimisation.
            </p>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-black/[0.06] text-xs">
          
          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-sm font-semibold text-[#0B0B0C]">
                Strict Data Minimization
              </div>
              <div className="text-[#6E6E73] mt-0.5 max-w-md">
                Strip any behavioral logs older than 90 days if the patron does not visit. Prevents stale profiling.
              </div>
            </div>
            <button
              onClick={() => setDataMinimization(!dataMinimization)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                dataMinimization ? 'bg-[#22C55E]' : 'bg-[#D1D1D6]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  dataMinimization ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
            <div>
              <div className="text-sm font-semibold text-[#0B0B0C]">
                Consent validity period
              </div>
              <div className="text-[#6E6E73] mt-0.5">
                Automatically prompt patrons to re-verify consent after this window.
              </div>
            </div>
            <select
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(Number(e.target.value))}
              className="h-10 px-3 rounded-[10px] bg-[#F9F9FA] border border-black/[0.1] text-xs text-[#0B0B0C] outline-none"
            >
              <option value={3}>3 months (Strict)</option>
              <option value={6}>6 months (Standard)</option>
              <option value={12}>12 months (Annual review)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
            <div>
              <div className="text-sm font-semibold text-[#0B0B0C]">
                Default outreach channel
              </div>
              <div className="text-[#6E6E73] mt-0.5">
                Used as the initial template channel when multiple channels are consented.
              </div>
            </div>
            <select
              value={defaultChannel}
              onChange={(e) => setDefaultChannel(e.target.value as any)}
              className="h-10 px-3 rounded-[10px] bg-[#F9F9FA] border border-black/[0.1] text-xs text-[#0B0B0C] outline-none capitalize"
            >
              <option value="whatsapp">WhatsApp (Direct messaging)</option>
              <option value="sms">SMS (Cellular text)</option>
              <option value="email">Email (Electronic mail)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Demo Controls Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B0B0C]">
              Presentation demo controls
            </h2>
            <p className="text-xs text-[#6E6E73]">
              Useful for jury evaluations, live pitch decks, and state resets.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#0B0B0C]">
                Live Presentation Mode
              </div>
              <div className="text-[#6E6E73] mt-0.5">
                Displays the "Diya: Consent ON/OFF" fast button in the top bar.
              </div>
            </div>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                demoMode ? 'bg-[#1EC7A0]' : 'bg-[#D1D1D6]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  demoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#0B0B0C]">
                Reset mock state to defaults
              </div>
              <div className="text-[#6E6E73] mt-0.5">
                Restores the 60 customers, visits, reviews, category offers, and audit logs.
              </div>
            </div>
            <button
              onClick={() => setResetModal(true)}
              className="h-9 px-4 rounded-[10px] bg-[#F1F1F2] hover:bg-[#E5E5EA] text-xs font-semibold text-[#0B0B0C] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset demo data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 border border-black/[0.08] shadow-2xl">
            <h3 className="text-lg font-bold text-[#0B0B0C] mb-2">
              Reset all demo data?
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed mb-6">
              This will reset the customer database, visits, reviews, tasks, and audit logs back to the default seed dataset.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setResetModal(false)}
                className="flex-1 h-10 rounded-[10px] bg-[#F1F1F2] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 h-10 rounded-[10px] bg-[#2F6BFF] text-white text-xs font-semibold cursor-pointer"
              >
                Reset now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 bg-[#0B0B0C] text-white px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>Preferences and classification thresholds saved!</span>
        </div>
      )}

    </div>
  );
};
