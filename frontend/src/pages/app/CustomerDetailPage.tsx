import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { getCustomerConsentStatus } from '../../lib/consent';
import { getDisplayContact } from '../../lib/permissions';
import { classify } from '../../lib/segmentation';
import {
  ArrowLeft,
  Calendar,
  Star,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Clock,
  Sparkles,
  Phone,
  Mail,
  EyeOff
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, visits, reviews, sentOffers, currentRole, categoryThresholds } = useNovaStore();

  const customer = customers.find((c) => c.id === id) || customers[0];
  const customerVisits = visits.filter((v) => v.customerId === customer.id);
  const customerReviews = reviews.filter((r) => r.customerId === customer.id);
  const customerOffers = sentOffers.filter((o) => o.customerId === customer.id);

  const consentStatus = getCustomerConsentStatus(customer);
  const classification = classify(customer, categoryThresholds);

  const displayPhone = getDisplayContact(customer, 'phone', currentRole);
  const displayEmail = getDisplayContact(customer, 'email', currentRole);

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/app/customers')}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#0B0B0C] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to customer directory</span>
      </button>

      {/* Profile Overview Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F1F2] text-[#3A3A3D]">
                {customer.id}
              </span>
              {customer.category === 'NEW' && (
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E6EEFF] text-[#2F6BFF]">
                  New Guest
                </span>
              )}
              {customer.category === 'REGULAR' && (
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E3F6EA] text-[#16A34A]">
                  Regular Patron
                </span>
              )}
              {customer.category === 'IRREGULAR' && (
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FEF0D6] text-[#D97706]">
                  Irregular / At-Risk
                </span>
              )}
              {customer.needsAttention && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30">
                  Needs Attention (14-21 days)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B0B0C]">
              {customer.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/consent/${customer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-[12px] bg-white border border-black/[0.1] hover:bg-[#F9F9FA] text-xs font-medium text-[#2F6BFF] flex items-center gap-1.5 shadow-xs"
            >
              <span>Customer consent portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Contact info with RBAC masking */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[20px] bg-[#F9F9FA] border border-black/[0.04] text-xs">
          <div>
            <span className="text-[#6E6E73] block mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Mobile contact
            </span>
            <span className="font-medium text-[#0B0B0C] font-mono">{displayPhone}</span>
            {currentRole !== 'owner' && customer.consent.personalisedOffers && (
              <span className="text-[10px] text-[#9A9A9E] block mt-0.5">(Masked for {currentRole})</span>
            )}
          </div>

          <div>
            <span className="text-[#6E6E73] block mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email address
            </span>
            <span className="font-medium text-[#0B0B0C] font-mono">{displayEmail}</span>
            {currentRole !== 'owner' && customer.consent.personalisedOffers && (
              <span className="text-[10px] text-[#9A9A9E] block mt-0.5">(Masked for {currentRole})</span>
            )}
          </div>

          <div>
            <span className="text-[#6E6E73] block mb-1">Consent Status</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${
                consentStatus === 'Full'
                  ? 'bg-[#22C55E]/15 text-[#16A34A]'
                  : consentStatus === 'Partial'
                  ? 'bg-[#F59E0B]/15 text-[#B45309]'
                  : 'bg-[#EF4444]/15 text-[#DC2626]'
              }`}
            >
              {consentStatus === 'Full' && <ShieldCheck className="w-3 h-3" />}
              {consentStatus === 'None' && <ShieldAlert className="w-3 h-3" />}
              <span>{consentStatus} Consent</span>
            </span>
          </div>
        </div>
      </div>

      {/* "Why this category?" explanation card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs">
        <h2 className="text-base font-semibold text-[#0B0B0C] mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2F6BFF]" />
          <span>Why is this patron classified as {customer.category}?</span>
        </h2>
        <p className="text-xs text-[#3A3A3D] leading-relaxed mb-4">
          {classification.reason}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-black/[0.05]">
          <div>
            <span className="text-[#6E6E73] block">Total visits</span>
            <span className="font-bold text-[#0B0B0C] tabular-nums">{customer.visitCount} check-ins</span>
          </div>
          <div>
            <span className="text-[#6E6E73] block">Monthly cadence</span>
            <span className="font-bold text-[#0B0B0C] tabular-nums">{customer.visitsPerMonth} visits/mo</span>
          </div>
          <div>
            <span className="text-[#6E6E73] block">Last visit gap</span>
            <span className="font-bold text-[#0B0B0C] tabular-nums">{customer.lastVisitDaysAgo} days ago</span>
          </div>
          <div>
            <span className="text-[#6E6E73] block">First registered</span>
            <span className="font-medium text-[#0B0B0C]">{customer.firstVisit}</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Visits Timeline & Reviews vs Offers History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left: Visits Timeline & Reviews */}
        <div className="space-y-6">
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs">
            <h2 className="text-base font-semibold text-[#0B0B0C] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2F6BFF]" />
              <span>Visit check-in timeline</span>
            </h2>

            {customerVisits.length > 0 ? (
              <div className="space-y-3">
                {customerVisits.map((v) => (
                  <div key={v.id} className="p-3.5 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#6E6E73]">
                      <span>{new Date(v.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span className="font-medium text-[#0B0B0C]">₹{v.spend || customer.avgSpend} spent</span>
                    </div>
                    {v.rating && (
                      <div className="flex items-center gap-1 text-[#F59E0B]">
                        {[...Array(v.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#F59E0B]" />
                        ))}
                      </div>
                    )}
                    {v.review && (
                      <p className="text-[#3A3A3D] italic">"{v.review}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#6E6E73]">
                Initial check-in logged on {customer.firstVisit}.
              </div>
            )}
          </div>

          {/* Customer Reviews */}
          {customerReviews.length > 0 && (
            <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs">
              <h2 className="text-base font-semibold text-[#0B0B0C] mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F59E0B]" />
                <span>Customer reviews ({customerReviews.length})</span>
              </h2>
              <div className="space-y-3">
                {customerReviews.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#F59E0B]">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B]" />
                        ))}
                      </div>
                      <span className="text-[#6E6E73] text-[11px]">{r.date}</span>
                    </div>
                    <p className="text-[#3A3A3D] leading-relaxed">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Offers Sent History */}
        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs">
          <h2 className="text-base font-semibold text-[#0B0B0C] mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#2F6BFF]" />
            <span>Category offers history</span>
          </h2>

          {customerOffers.length > 0 ? (
            <div className="space-y-3">
              {customerOffers.map((o) => (
                <div key={o.id} className="p-3.5 rounded-[16px] bg-[#F9F9FA] border border-black/[0.04] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0B0B0C]">{o.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        o.status === 'Redeemed'
                          ? 'bg-[#22C55E]/15 text-[#16A34A]'
                          : 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#6E6E73] text-[11px]">
                    <span className="capitalize">Via {o.channel}</span>
                    <span className="font-mono text-[#0B0B0C]">Code: {o.discount}</span>
                  </div>
                  <div className="text-[10px] text-[#9A9A9E]">
                    Dispatched on {new Date(o.sentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#6E6E73]">
              No direct promotions sent yet. Patron is queued for the next {customer.category} category batch.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
