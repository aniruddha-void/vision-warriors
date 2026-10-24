import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { segmentDefinitions } from '../../data/segments';
import { getSegmentMembers } from '../../lib/segmentation';
import { getCustomerConsentStatus } from '../../lib/consent';
import { ArrowLeft, ShieldCheck, AlertTriangle, EyeOff, ExternalLink } from 'lucide-react';

export const SegmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useNovaStore();

  const segment = segmentDefinitions.find((s) => s.id === id) || segmentDefinitions[0];
  const filterResult = getSegmentMembers(customers, segment.id);

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/segments')}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#0B0B0C] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to segments</span>
      </button>

      {/* Segment Header Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <h1 className="text-2xl font-semibold text-[#0B0B0C]">
              {segment.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#22C55E]/10 text-[#16A34A] font-semibold px-3 py-1 rounded-full">
              {filterResult.eligibleCustomers.length} active eligible
            </span>
            {filterResult.excludedCustomers.length > 0 && (
              <span className="text-xs bg-[#F59E0B]/15 text-[#B45309] font-semibold px-3 py-1 rounded-full">
                {filterResult.excludedCustomers.length} consent-excluded
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-[#6E6E73] mb-4">
          {segment.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/[0.06] text-xs">
          <div>
            <span className="text-[#6E6E73] block mb-1">Inclusion logic rule:</span>
            <span className="font-medium text-[#0B0B0C]">"{segment.ruleDescription}"</span>
          </div>
          <div>
            <span className="text-[#6E6E73] block mb-1">Required consent fields:</span>
            <span className="font-medium text-[#2F6BFF]">{segment.requiredConsent.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Eligible Customers Table */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#0B0B0C] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Eligible patrons with active consent ({filterResult.eligibleCustomers.length})</span>
        </h2>

        <div className="bg-white rounded-[24px] border border-black/[0.08] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F9FA] border-b border-black/[0.06] text-[#6E6E73] font-semibold uppercase">
              <tr>
                <th className="py-3 px-5">Patron ID</th>
                <th className="py-3 px-5">Customer Name</th>
                <th className="py-3 px-5">Visits / Month</th>
                <th className="py-3 px-5">Last Visit</th>
                <th className="py-3 px-5">Avg Spend</th>
                <th className="py-3 px-5">Favorite Blend</th>
                <th className="py-3 px-5 text-right">Consent Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filterResult.eligibleCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9F9FA]/80">
                  <td className="py-3 px-5 font-mono font-semibold text-[#0B0B0C]">{c.id}</td>
                  <td className="py-3 px-5 font-medium text-[#0B0B0C]">{c.name}</td>
                  <td className="py-3 px-5 tabular-nums text-[#3A3A3D]">{c.visitsPerMonth} visits</td>
                  <td className="py-3 px-5 tabular-nums text-[#3A3A3D]">{c.lastVisitDaysAgo} days ago</td>
                  <td className="py-3 px-5 tabular-nums font-medium text-[#0B0B0C]">₹{c.avgSpend}</td>
                  <td className="py-3 px-5 text-[#3A3A3D]">{c.favouriteCategory}</td>
                  <td className="py-3 px-5 text-right">
                    <Link
                      to={`/consent/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2F6BFF] hover:underline"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excluded Customers Table (Privacy Respect in Action) */}
      {filterResult.excludedCustomers.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#0B0B0C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              <span>Excluded by privacy preferences ({filterResult.excludedCustomers.length})</span>
            </h2>
            <span className="text-xs text-[#6E6E73]">
              Private metrics masked automatically
            </span>
          </div>

          <div className="bg-white rounded-[24px] border border-black/[0.08] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFBEB] border-b border-[#F59E0B]/20 text-[#B45309] font-semibold uppercase">
                <tr>
                  <th className="py-3 px-5">Patron ID</th>
                  <th className="py-3 px-5">Consent Tier</th>
                  <th className="py-3 px-5">Specific Privacy Reason</th>
                  <th className="py-3 px-5">Visits / Month</th>
                  <th className="py-3 px-5">Avg Spend</th>
                  <th className="py-3 px-5 text-right">Portal Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {filterResult.excludedCustomers.map(({ customer: c, reason }) => {
                  const status = getCustomerConsentStatus(c);
                  return (
                    <tr key={c.id} className="hover:bg-[#F9F9FA]/80">
                      <td className="py-3 px-5 font-mono font-semibold text-[#0B0B0C]">{c.id}</td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#DC2626] font-semibold text-[11px]">
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-[#B45309] font-medium">{reason}</td>
                      <td className="py-3 px-5 text-[#9A9A9E] italic flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Hidden (no consent)
                      </td>
                      <td className="py-3 px-5 text-[#9A9A9E] italic">Hidden</td>
                      <td className="py-3 px-5 text-right">
                        <Link
                          to={`/consent/${c.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#2F6BFF] hover:underline"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
