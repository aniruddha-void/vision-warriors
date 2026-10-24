import React, { useState } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { getCustomerConsentStatus } from '../../lib/consent';
import { getDisplayContact } from '../../lib/permissions';
import { CustomerCategory } from '../../types';
import { Search, ExternalLink, ShieldCheck, ShieldAlert, EyeOff, Lock, UserCheck, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, currentRole } = useNovaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CustomerCategory>('all');

  const filteredCustomers = customers.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.favouriteCategory.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Customer directory & category tracking
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Auto-classified into New, Regular, and Irregular. Contact info is masked for {currentRole}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-full border border-black/[0.08] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="text-[#3A3A3D]">Total tracked: <b className="text-[#0B0B0C] tabular-nums">{customers.length}</b></span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'NEW', 'REGULAR', 'IRREGULAR'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setCategoryFilter(filter)}
              className={`h-9 px-4 rounded-[12px] text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                categoryFilter === filter
                  ? 'bg-[#0B0B0C] text-white shadow-xs'
                  : 'bg-white border border-black/[0.08] text-[#6E6E73] hover:text-[#0B0B0C]'
              }`}
            >
              {filter === 'all'
                ? 'All patrons'
                : filter === 'NEW'
                ? 'New Guests'
                : filter === 'REGULAR'
                ? 'Regulars'
                : 'Irregular (21+ days)'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9A9A9E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, name, or beverage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs bg-white rounded-[12px] border border-black/[0.08] focus:border-[#2F6BFF] outline-none"
          />
        </div>

      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[28px] border border-black/[0.08] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F9FA] border-b border-black/[0.06] text-[#6E6E73] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Patron ID</th>
                <th className="py-3.5 px-5">Name</th>
                <th className="py-3.5 px-5">Contact (Masked)</th>
                <th className="py-3.5 px-5">Category Tier</th>
                <th className="py-3.5 px-5">Last Visit</th>
                <th className="py-3.5 px-5">Total Visits</th>
                <th className="py-3.5 px-5">Consent Tier</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filteredCustomers.map((customer) => {
                const consentStatus = getCustomerConsentStatus(customer);
                const hasPersonalised = customer.consent.personalisedOffers;
                const displayContact = getDisplayContact(
                  customer,
                  customer.preferredChannel === 'email' ? 'email' : 'phone',
                  currentRole
                );

                return (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`/app/customers/${customer.id}`)}
                    className="hover:bg-[#F9F9FA]/80 transition-colors cursor-pointer"
                  >
                    {/* Anonymised ID */}
                    <td className="py-3.5 px-5 font-mono font-semibold text-[#0B0B0C]">
                      {customer.id}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-5 font-medium text-[#0B0B0C]">
                      {customer.name}
                    </td>

                    {/* Contact (Masked by RBAC) */}
                    <td className="py-3.5 px-5 font-mono text-[#3A3A3D]">
                      {displayContact}
                    </td>

                    {/* Category Chip */}
                    <td className="py-3.5 px-5">
                      {customer.category === 'NEW' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6EEFF] text-[#2F6BFF]">
                          New
                        </span>
                      )}
                      {customer.category === 'REGULAR' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E3F6EA] text-[#16A34A]">
                          Regular
                        </span>
                      )}
                      {customer.category === 'IRREGULAR' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF0D6] text-[#D97706]">
                          Irregular
                        </span>
                      )}
                      {customer.needsAttention && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30 font-medium">
                          Attention
                        </span>
                      )}
                    </td>

                    {/* Last visit */}
                    <td className="py-3.5 px-5 tabular-nums">
                      {customer.lastVisitDaysAgo === 0
                        ? 'Today'
                        : `${customer.lastVisitDaysAgo} days ago`}
                    </td>

                    {/* Total visits */}
                    <td className="py-3.5 px-5 tabular-nums font-semibold text-[#0B0B0C]">
                      {customer.visitCount} visits
                    </td>

                    {/* Consent Tier */}
                    <td className="py-3.5 px-5">
                      {consentStatus === 'Full' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#16A34A] font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Full
                        </span>
                      )}
                      {consentStatus === 'Partial' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#B45309] font-semibold">
                          <UserCheck className="w-3 h-3" /> Partial
                        </span>
                      )}
                      {consentStatus === 'None' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 text-[#DC2626] font-semibold">
                          <ShieldAlert className="w-3 h-3" /> None
                        </span>
                      )}
                    </td>

                    {/* View link */}
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-[#2F6BFF] hover:underline font-medium">
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-sm text-[#6E6E73]">
            No patrons found matching "{searchTerm}".
          </div>
        )}
      </div>

    </div>
  );
};
