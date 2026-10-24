import React from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { getCategoryBreakdown } from '../../lib/segmentation';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  ChevronRight,
  Coffee,
  Tag,
  Star,
  QrCode
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, visits, reviews, tasks, toggleTaskCompletion, ownerName, categoryThresholds } = useNovaStore();

  const totalCustomers = customers.length;
  const consentedCustomers = customers.filter((c) => c.consent.personalisedOffers);
  const consentPercentage = Math.round((consentedCustomers.length / totalCustomers) * 100);

  const breakdown = getCategoryBreakdown(customers, categoryThresholds);
  const newCount = breakdown.newCustomers.length;
  const regularCount = breakdown.regularCustomers.length;
  const irregularCount = breakdown.irregularCustomers.length;

  // Not seen in 21+ days list (At-risk)
  const notSeenIn21Days = breakdown.irregularCustomers.slice(0, 5);

  // Today's recent check-ins
  const recentVisits = visits.slice(0, 5);

  // Completed tasks count
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const tasksPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-8">
      
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">
            <span className="text-[#9A9A9E]">Good morning, </span>
            <span className="text-[#0B0B0C] font-semibold">{ownerName}</span>
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1">
            Chai & Co counter overview. Automatic patron categorization & explainable offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/app/qr')}
            className="h-10 px-4 rounded-[12px] bg-white border border-black/[0.08] hover:bg-[#F9F9FA] text-xs font-semibold text-[#0B0B0C] flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <QrCode className="w-4 h-4 text-[#2F6BFF]" />
            <span>Counter QR</span>
          </button>
          <button
            onClick={() => navigate('/app/offers')}
            className="h-10 px-4 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Tag className="w-4 h-4" />
            <span>Review category offers</span>
          </button>
        </div>
      </div>

      {/* 5 Stat Cards: Total, New, Regular, Irregular, Consented % */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Customers */}
        <div className="rounded-[24px] bg-white border border-black/[0.07] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Total Patrons
            </span>
            <Users className="w-4 h-4 text-[#6E6E73]" />
          </div>
          <div className="text-3xl font-bold text-[#0B0B0C] tabular-nums tracking-tight">
            {totalCustomers}
          </div>
          <div className="text-[11px] text-[#22C55E] mt-1 font-medium">
            Active in database
          </div>
        </div>

        {/* New Guests */}
        <div className="rounded-[24px] bg-white border border-black/[0.07] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              New Guests
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6BFF]" />
          </div>
          <div className="text-3xl font-bold text-[#2F6BFF] tabular-nums tracking-tight">
            {newCount}
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-1">
            Total visits &le; {categoryThresholds.newMaxVisits}
          </div>
        </div>

        {/* Regulars */}
        <div className="rounded-[24px] bg-white border border-black/[0.07] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Regulars
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          </div>
          <div className="text-3xl font-bold text-[#16A34A] tabular-nums tracking-tight">
            {regularCount}
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-1">
            Frequent weekly guests
          </div>
        </div>

        {/* Irregular / At-Risk */}
        <div className="rounded-[24px] bg-white border border-black/[0.07] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Irregular
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
          </div>
          <div className="text-3xl font-bold text-[#D97706] tabular-nums tracking-tight">
            {irregularCount}
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-1">
            Absent 21+ days
          </div>
        </div>

        {/* Consented % */}
        <div className="rounded-[24px] bg-white border border-black/[0.07] p-5 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Consented %
            </span>
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-3xl font-bold text-[#0B0B0C] tabular-nums tracking-tight">
            {consentPercentage}%
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-1">
            {consentedCustomers.length} consented
          </div>
        </div>

      </div>

      {/* Category Offers Row (New, Regular, Irregular) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0B0B0C]">
              Suggested discount offers by category
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#1EC0FF]/15 text-[#0070A3] text-xs font-semibold">
              Ready to dispatch
            </span>
          </div>
          <button
            onClick={() => navigate('/app/offers')}
            className="text-xs font-semibold text-[#2F6BFF] hover:underline flex items-center gap-1"
          >
            <span>Inspect all 3 categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* New Offer */}
          <div
            onClick={() => navigate('/app/offers/new')}
            className="rounded-[24px] bg-white border border-black/[0.08] p-5 hover:border-black/[0.18] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6EEFF] text-[#2F6BFF]">
                  NEW &bull; {newCount} patrons
                </span>
                <span className="text-xs font-bold text-[#0B0B0C]">10% OFF</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B0B0C] mb-1">
                Welcome 10% on next visit
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Nudges 2nd visit within 10 days for highest retention conversion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#2F6BFF] font-medium">
              <span>Review offer & templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Regular Offer */}
          <div
            onClick={() => navigate('/app/offers/regular')}
            className="rounded-[24px] bg-white border border-black/[0.08] p-5 hover:border-black/[0.18] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E3F6EA] text-[#16A34A]">
                  REGULAR &bull; {regularCount} patrons
                </span>
                <span className="text-xs font-bold text-[#0B0B0C]">FREE ITEM</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B0B0C] mb-1">
                Loyalty reward on 5th visit
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Recognizes attendance streaks with complimentary Bun Maska or specialty brew.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#2F6BFF] font-medium">
              <span>Review offer & templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Irregular Offer */}
          <div
            onClick={() => navigate('/app/offers/irregular')}
            className="rounded-[24px] bg-white border border-black/[0.08] p-5 hover:border-black/[0.18] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF0D6] text-[#D97706]">
                  IRREGULAR &bull; {irregularCount} patrons
                </span>
                <span className="text-xs font-bold text-[#0B0B0C]">20% OFF</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B0B0C] mb-1">
                Win-back 20% discount (7 days)
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Targets patrons absent 21+ days with an urgent warm invitation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#2F6BFF] font-medium">
              <span>Review offer & templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Widgets Grid: Today's Check-ins, Not seen in 21+ days, To do list, Activity Concentric Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Widget 1: Today's check-ins (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#0B0B0C] flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#2F6BFF]" />
                <span>Today's counter check-ins</span>
              </h3>
              <span className="text-xs bg-[#22C55E]/10 text-[#16A34A] px-2 py-0.5 rounded-full font-semibold">
                Live
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mb-4">
              Recent patrons who scanned the counter QR code.
            </p>

            <div className="space-y-2.5">
              {recentVisits.map((v) => {
                const customer = customers.find((c) => c.id === v.customerId);
                return (
                  <div key={v.id} className="p-3 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#0B0B0C]">{customer?.name || v.customerId}</div>
                      <div className="text-[11px] text-[#6E6E73]">
                        {new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ₹{v.spend || 300}
                      </div>
                    </div>
                    {customer && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-black/[0.08]">
                        {customer.category}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-black/[0.05] text-center text-xs">
            <Link to="/app/customers" className="text-[#2F6BFF] hover:underline font-medium">
              View all customer check-ins &rarr;
            </Link>
          </div>
        </div>

        {/* Widget 2: Not seen in 21+ days (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#0B0B0C] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>Not seen in 21+ days</span>
              </h3>
              <span className="text-xs bg-[#FEF0D6] text-[#D97706] px-2 py-0.5 rounded-full font-semibold tabular-nums">
                {irregularCount}
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mb-4">
              Previously active patrons who have paused visits.
            </p>

            <div className="space-y-2.5">
              {notSeenIn21Days.map(({ customer: c }) => (
                <div key={c.id} className="p-3 rounded-[16px] bg-[#FFFBEB]/50 border border-[#F59E0B]/20 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#0B0B0C]">{c.name}</div>
                    <div className="text-[11px] text-[#D97706] font-medium">
                      Absent {c.lastVisitDaysAgo} days &bull; {c.visitCount} past visits
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/app/offers/irregular')}
                    className="h-7 px-2.5 rounded-[8px] bg-white border border-black/[0.1] text-[11px] font-medium text-[#2F6BFF] hover:bg-[#F9F9FA]"
                  >
                    Win-back
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-black/[0.05] text-center text-xs">
            <Link to="/app/offers/irregular" className="text-[#D97706] hover:underline font-medium">
              Send 20% win-back offer &rarr;
            </Link>
          </div>
        </div>

        {/* Widget 3: Activity Concentric Rings & To-Do (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs space-y-5">
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-[#0B0B0C]">
                Activity rings
              </h3>
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                  <circle cx="60" cy="60" r="48" stroke="#F1F1F2" strokeWidth="10" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#1EC0FF"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={301.5}
                    strokeDashoffset={301.5 * (1 - consentPercentage / 100)}
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="60" r="32" stroke="#F1F1F2" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="32"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={201}
                    strokeDashoffset={201 * (1 - tasksPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-bold text-[#0B0B0C] tabular-nums">{consentPercentage}%</span>
                  <span className="text-[10px] text-[#6E6E73] block">Consented</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1EC0FF]" />
                  <span>Consented patrons</span>
                </div>
                <span className="font-semibold text-[#0B0B0C] tabular-nums">{consentPercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>Daily tasks complete</span>
                </div>
                <span className="font-semibold text-[#0B0B0C] tabular-nums">{completedTasks}/{totalTasks}</span>
              </div>
            </div>
          </div>

          {/* Quick checklist */}
          <div className="pt-3 border-t border-black/[0.05]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] block mb-2">
              Queue highlights
            </span>
            <div className="space-y-2">
              {tasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskCompletion(t.id)}
                  className="flex items-center gap-2.5 text-xs cursor-pointer p-1.5 rounded-lg hover:bg-[#F6F6F7]"
                >
                  <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${t.completed ? 'bg-[#22C55E] text-white' : 'border border-black/[0.2]'}`}>
                    {t.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`truncate ${t.completed ? 'line-through text-[#9A9A9E]' : 'text-[#0B0B0C]'}`}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
