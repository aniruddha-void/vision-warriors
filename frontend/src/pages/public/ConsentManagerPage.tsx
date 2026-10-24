import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { Logo } from '../../components/ui/Logo';
import { PillBadge } from '../../components/ui/PillBadge';
import { Check, ShieldAlert, Download, Trash2, ArrowLeft, Coffee, Gift, Sparkles, MessageSquare, Smartphone, Mail, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ConsentManagerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const customers = useNovaStore((s) => s.customers);
  const updateCustomerConsent = useNovaStore((s) => s.updateCustomerConsent);
  const deleteCustomerData = useNovaStore((s) => s.deleteCustomerData);
  const exportCustomerData = useNovaStore((s) => s.exportCustomerData);

  // Find customer or fallback to first customer
  const targetId = customerId || 'C-1002';
  const customer = customers.find((c) => c.id === targetId) || customers[0];

  // Local form state
  const [personalisedOffers, setPersonalisedOffers] = useState(true);
  const [purchaseHistory, setPurchaseHistory] = useState(true);
  const [visitFrequency, setVisitFrequency] = useState(true);
  const [location, setLocation] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);

  const [savedToast, setSavedToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Sync state when customer loads
  useEffect(() => {
    if (customer && customer.consent) {
      setPersonalisedOffers(customer.consent.personalisedOffers);
      setPurchaseHistory(customer.consent.purchaseHistory);
      setVisitFrequency(customer.consent.visitFrequency);
      setLocation(customer.consent.location);
      setWhatsapp(customer.consent.channels?.whatsapp ?? true);
      setSms(customer.consent.channels?.sms ?? false);
      setEmail(customer.consent.channels?.email ?? false);
    }
  }, [customer]);

  if (!customer || isDeleted) {
    return (
      <div className="min-h-screen bg-[#F6F6F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-[24px] bg-white border border-black/[0.08] shadow-sm flex items-center justify-center mb-6">
          <Trash2 className="w-7 h-7 text-[#EF4444]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B0B0C] mb-2">
          {isDeleted ? 'Data successfully deleted' : 'Customer record not found'}
        </h1>
        <p className="text-sm text-[#6E6E73] max-w-md mb-6">
          {isDeleted
            ? 'All personal profile, purchase history, and visit records have been scrubbed from Chai & Co systems in accordance with your right to be forgotten.'
            : 'The requested customer ID does not exist in our privacy directory.'}
        </p>
        <Link
          to="/"
          className="h-11 px-6 rounded-[12px] bg-[#0B0B0C] text-white font-medium text-sm flex items-center justify-center"
        >
          Return to home
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    updateCustomerConsent(customer.id, {
      personalisedOffers,
      purchaseHistory: personalisedOffers ? purchaseHistory : false,
      visitFrequency: personalisedOffers ? visitFrequency : false,
      location: personalisedOffers ? location : false,
      channels: {
        whatsapp: personalisedOffers ? whatsapp : false,
        sms: personalisedOffers ? sms : false,
        email: personalisedOffers ? email : false,
      },
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2F6BFF', '#1EC0FF', '#1EC7A0'],
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const handleWithdrawAll = () => {
    setPersonalisedOffers(false);
    setPurchaseHistory(false);
    setVisitFrequency(false);
    setLocation(false);
    setWhatsapp(false);
    setSms(false);
    setEmail(false);

    updateCustomerConsent(customer.id, {
      personalisedOffers: false,
      purchaseHistory: false,
      visitFrequency: false,
      location: false,
      channels: { whatsapp: false, sms: false, email: false },
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const handleDownloadData = () => {
    const jsonString = exportCustomerData(customer.id);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nova-privacy-data-${customer.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = () => {
    deleteCustomerData(customer.id);
    setShowDeleteModal(false);
    setIsDeleted(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] pb-20">
      
      {/* Top Header */}
      <header className="bg-white border-b border-black/[0.06] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-[#6E6E73] hover:text-[#0B0B0C]">
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Logo size="sm" showSubtitle={false} />
          <div className="text-xs font-mono text-[#6E6E73] bg-[#F1F1F2] px-2.5 py-1 rounded-full">
            {customer.id}
          </div>
        </div>
      </header>

      {/* Main Container: Mobile-First */}
      <main className="max-w-2xl mx-auto px-4 pt-8">
        
        {/* Banner with avatar/greeting */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <PillBadge dotColor={personalisedOffers ? '#22C55E' : '#EF4444'}>
              {personalisedOffers ? 'Personalised mode ON' : 'Privacy fallback mode'}
            </PillBadge>
            <span className="text-xs text-[#6E6E73]">
              Chai & Co &bull; 4th Avenue
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-[#0B0B0C] tracking-tight">
            Your data, your choice
          </h1>
          <p className="text-[15px] text-[#6E6E73] mt-1.5 leading-relaxed">
            Welcome, <b>{customer.name}</b>. You decide what Chai & Co can use to suggest your brews and treats.
          </p>
        </div>

        {/* Live Preview Card: Shows in real-time what the customer gets */}
        <div className="mb-8 rounded-[24px] p-5 sm:p-6 transition-all border shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-white border-black/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2F6BFF]" /> Live offer preview
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                personalisedOffers
                  ? 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                  : 'bg-[#F59E0B]/15 text-[#B45309]'
              }`}
            >
              {personalisedOffers ? 'Personalised for you' : 'General fallback offer'}
            </span>
          </div>

          <div className="rounded-[18px] p-4 bg-[#F9F9FA] border border-black/[0.04] mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-white border border-black/[0.06] flex items-center justify-center text-[#2F6BFF] shrink-0 shadow-sm">
                {personalisedOffers ? <Coffee className="w-5 h-5" /> : <Gift className="w-5 h-5 text-[#F59E0B]" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0B0B0C] leading-snug">
                  {personalisedOffers
                    ? `Complimentary Bun Maska with your favorite ${customer.favouriteCategory}`
                    : 'Cutting Masala Chai & Samosa Duo Special (₹120)'}
                </h2>
                <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                  {personalisedOffers
                    ? `Crafted using your visit frequency (${customer.visitsPerMonth} visits/mo) and preference for ${customer.favouriteCategory}.`
                    : 'Non-personalised general offer based purely on overall shop favorites. No private profiling.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6E6E73] pt-1">
            <span>Customer status: <b className="text-[#0B0B0C]">{personalisedOffers ? 'Consented' : 'Anonymous'}</b></span>
            <span>Channel: <b className="text-[#0B0B0C] capitalize">{customer.preferredChannel}</b></span>
          </div>
        </div>

        {/* Master Consent Toggle Card */}
        <div className="mb-6 rounded-[24px] bg-white border border-black/[0.08] p-5 sm:p-6 shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#0B0B0C]">
                  Personalised offers (Master Switch)
                </h3>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                Allow Chai & Co to provide tailored menu recommendations and loyalty surprises.
              </p>
            </div>
            <button
              onClick={() => setPersonalisedOffers(!personalisedOffers)}
              type="button"
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                personalisedOffers ? 'bg-[#2F6BFF]' : 'bg-[#D1D1D6]'
              }`}
              role="switch"
              aria-checked={personalisedOffers}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  personalisedOffers ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Purpose Toggles Group */}
        <div className="mb-6 rounded-[24px] bg-white border border-black/[0.08] p-5 sm:p-6 shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-4">
            Data usage purposes
          </div>

          <div className="space-y-4 divide-y divide-black/[0.05]">
            
            {/* Toggle 1: Purchase History */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <div className="text-sm font-medium text-[#0B0B0C]">
                  Purchase history
                </div>
                <div className="text-xs text-[#6E6E73] mt-0.5">
                  Used to suggest snack and tea pairings you actually enjoy.
                </div>
              </div>
              <button
                disabled={!personalisedOffers}
                onClick={() => setPurchaseHistory(!purchaseHistory)}
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  personalisedOffers && purchaseHistory ? 'bg-[#22C55E]' : 'bg-[#D1D1D6]'
                } ${!personalisedOffers ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={purchaseHistory}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    personalisedOffers && purchaseHistory ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Visit Frequency */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div>
                <div className="text-sm font-medium text-[#0B0B0C]">
                  Visit frequency
                </div>
                <div className="text-xs text-[#6E6E73] mt-0.5">
                  Tracks how often you drop in to reward loyal streaks & win-back treats.
                </div>
              </div>
              <button
                disabled={!personalisedOffers}
                onClick={() => setVisitFrequency(!visitFrequency)}
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  personalisedOffers && visitFrequency ? 'bg-[#22C55E]' : 'bg-[#D1D1D6]'
                } ${!personalisedOffers ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={visitFrequency}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    personalisedOffers && visitFrequency ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Location (OFF by default) */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0B0B0C]">
                    Location tracking
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444]">
                    Disabled by default
                  </span>
                </div>
                <div className="text-xs text-[#6E6E73] mt-0.5">
                  GPS coordinates outside the shop. Not needed for any cafe service.
                </div>
              </div>
              <button
                disabled={!personalisedOffers}
                onClick={() => setLocation(!location)}
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  personalisedOffers && location ? 'bg-[#22C55E]' : 'bg-[#D1D1D6]'
                } ${!personalisedOffers ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={location}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    personalisedOffers && location ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Channel Preferences */}
        <div className="mb-8 rounded-[24px] bg-white border border-black/[0.08] p-5 sm:p-6 shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-4">
            Communication channels
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* WhatsApp */}
            <button
              type="button"
              disabled={!personalisedOffers}
              onClick={() => setWhatsapp(!whatsapp)}
              className={`p-3.5 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                whatsapp && personalisedOffers
                  ? 'border-[#22C55E] bg-[#22C55E]/5'
                  : 'border-black/[0.08] bg-[#F9F9FA]'
              } ${!personalisedOffers ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0B0B0C]">WhatsApp</div>
                  <div className="text-[10px] text-[#6E6E73]">Direct & fast</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${whatsapp && personalisedOffers ? 'bg-[#22C55E] text-white' : 'border border-black/[0.2]'}`}>
                {whatsapp && personalisedOffers && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>

            {/* SMS */}
            <button
              type="button"
              disabled={!personalisedOffers}
              onClick={() => setSms(!sms)}
              className={`p-3.5 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                sms && personalisedOffers
                  ? 'border-[#2F6BFF] bg-[#2F6BFF]/5'
                  : 'border-black/[0.08] bg-[#F9F9FA]'
              } ${!personalisedOffers ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2F6BFF]/15 text-[#2F6BFF] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0B0B0C]">SMS</div>
                  <div className="text-[10px] text-[#6E6E73]">Text alerts</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sms && personalisedOffers ? 'bg-[#2F6BFF] text-white' : 'border border-black/[0.2]'}`}>
                {sms && personalisedOffers && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>

            {/* Email */}
            <button
              type="button"
              disabled={!personalisedOffers}
              onClick={() => setEmail(!email)}
              className={`p-3.5 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                email && personalisedOffers
                  ? 'border-[#F59E0B] bg-[#F59E0B]/5'
                  : 'border-black/[0.08] bg-[#F9F9FA]'
              } ${!personalisedOffers ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0B0B0C]">Email</div>
                  <div className="text-[10px] text-[#6E6E73]">Monthly letters</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${email && personalisedOffers ? 'bg-[#F59E0B] text-white' : 'border border-black/[0.2]'}`}>
                {email && personalisedOffers && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
          <button
            onClick={handleSave}
            className="w-full sm:flex-1 h-[46px] rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Save choices</span>
          </button>
          <button
            onClick={handleWithdrawAll}
            className="w-full sm:w-auto h-[46px] px-5 rounded-[12px] bg-white border border-[#EF4444]/40 hover:bg-[#FEF2F2] text-[#EF4444] font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Withdraw all consent</span>
          </button>
        </div>

        {/* Data Portability and Erasure Links */}
        <div className="p-5 rounded-[22px] bg-[#F1F1F2] border border-black/[0.06] space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
            Data rights & portability
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <button
              onClick={handleDownloadData}
              className="inline-flex items-center gap-2 text-[#2F6BFF] hover:underline font-medium cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download my data (JSON file)</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 text-[#EF4444] hover:underline font-medium cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete my data permanently</span>
            </button>
          </div>
        </div>

        {/* Toast confirmation */}
        {savedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0B0B0C] text-white px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 z-50 animate-bounce">
            <Check className="w-4 h-4 text-[#22C55E]" />
            <span>Preferences saved and synced to Chai & Co instantly!</span>
          </div>
        )}

      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 border border-black/[0.08] shadow-2xl">
            <div className="w-12 h-12 rounded-[16px] bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#0B0B0C] mb-2">
              Permanently delete all your records?
            </h3>
            <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">
              This will immediately purge your customer profile ({customer.id}), visit logs, and preferences from Chai & Co. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-[12px] bg-[#F1F1F2] hover:bg-[#E5E5EA] text-[#0B0B0C] font-medium text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-11 rounded-[12px] bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
              >
                Yes, delete my data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
