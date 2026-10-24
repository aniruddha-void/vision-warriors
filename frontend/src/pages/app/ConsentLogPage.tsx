import React, { useState } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { ShieldCheck, ShieldAlert, RefreshCw, Download, Trash2, Info, Search, Activity, User } from 'lucide-react';

export const ConsentLogPage: React.FC = () => {
  const { consentLogs, auditLogs } = useNovaStore();

  const [activeTab, setActiveTab] = useState<'consent' | 'activity'>('consent');
  const [consentFilter, setConsentFilter] = useState<'All' | 'Granted' | 'Updated' | 'Withdrawn'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConsentLogs = consentLogs.filter((log) => {
    if (consentFilter !== 'All' && log.eventType !== consentFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.customerId.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.eventType.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.user.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.role.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Consent and activity audit log
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Immutable compliance ledger. Records all customer preferences and staff system actions.
          </p>
        </div>

        <div className="text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Audit trail active</span>
        </div>
      </div>

      {/* Main Tabs: Consent vs Activity */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] pb-1">
        <button
          onClick={() => setActiveTab('consent')}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'consent'
              ? 'border-[#2F6BFF] text-[#2F6BFF]'
              : 'border-transparent text-[#6E6E73] hover:text-[#0B0B0C]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Customer Consent Events ({consentLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'border-[#2F6BFF] text-[#2F6BFF]'
              : 'border-transparent text-[#6E6E73] hover:text-[#0B0B0C]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Staff & System Activity ({auditLogs.length})</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {activeTab === 'consent' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Granted', 'Updated', 'Withdrawn'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setConsentFilter(tab)}
                className={`h-9 px-4 rounded-[12px] text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  consentFilter === tab
                    ? 'bg-[#0B0B0C] text-white shadow-xs'
                    : 'bg-white border border-black/[0.08] text-[#6E6E73] hover:text-[#0B0B0C]'
                }`}
              >
                {tab === 'All' ? 'All consent events' : `${tab} events`}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[#6E6E73] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>Audit logging complies with role-based access control</span>
          </div>
        )}

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9A9A9E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs bg-white rounded-[12px] border border-black/[0.08] focus:border-[#2F6BFF] outline-none"
          />
        </div>
      </div>

      {/* TAB 1: Consent Events */}
      {activeTab === 'consent' && (
        <div className="space-y-4">
          <div className="p-4 rounded-[20px] bg-[#FFFBEB] border border-[#F59E0B]/30 flex items-start gap-3 text-xs text-[#3A3A3D]">
            <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-[#0B0B0C]">Automatic exclusion rule: </strong>
              Withdrawn customers are automatically excluded from all personalized actions and category offers.
            </span>
          </div>

          <div className="bg-white rounded-[28px] border border-black/[0.08] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F9FA] border-b border-black/[0.06] text-[#6E6E73] font-semibold uppercase">
                  <tr>
                    <th className="py-3.5 px-5">Timestamp</th>
                    <th className="py-3.5 px-5">Patron ID</th>
                    <th className="py-3.5 px-5">Event Action</th>
                    <th className="py-3.5 px-5">Consented Purposes</th>
                    <th className="py-3.5 px-5">Channels</th>
                    <th className="py-3.5 px-5">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {filteredConsentLogs.map((log) => {
                    const isGranted = log.eventType === 'Granted';
                    const isWithdrawn = log.eventType === 'Withdrawn';
                    const isUpdated = log.eventType === 'Updated';
                    const isExported = log.eventType === 'Data Exported';
                    const isDeleted = log.eventType === 'Data Deleted';

                    return (
                      <tr key={log.id} className="hover:bg-[#F9F9FA]/80">
                        <td className="py-3.5 px-5 tabular-nums text-[#6E6E73] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-5 font-mono font-semibold text-[#0B0B0C]">
                          {log.customerId}
                        </td>
                        <td className="py-3.5 px-5">
                          {isGranted && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#16A34A] font-semibold">
                              <ShieldCheck className="w-3 h-3" /> Granted
                            </span>
                          )}
                          {isUpdated && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF] font-semibold">
                              <RefreshCw className="w-3 h-3" /> Updated
                            </span>
                          )}
                          {isWithdrawn && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 text-[#DC2626] font-semibold">
                              <ShieldAlert className="w-3 h-3" /> Withdrawn
                            </span>
                          )}
                          {isExported && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#7C3AED] font-semibold">
                              <Download className="w-3 h-3" /> Exported
                            </span>
                          )}
                          {isDeleted && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B0B0C] text-white font-semibold">
                              <Trash2 className="w-3 h-3" /> Deleted
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-[#3A3A3D]">
                          {log.purposes.length > 0 ? log.purposes.join(', ') : <span className="text-[#9A9A9E] italic">None</span>}
                        </td>
                        <td className="py-3.5 px-5 text-[#3A3A3D]">
                          {log.channels.length > 0 ? log.channels.join(', ') : <span className="text-[#9A9A9E] italic">None</span>}
                        </td>
                        <td className="py-3.5 px-5 text-[#6E6E73] max-w-xs leading-relaxed">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Staff & System Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-[28px] border border-black/[0.08] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F9FA] border-b border-black/[0.06] text-[#6E6E73] font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">User & Role</th>
                  <th className="py-3.5 px-5">Action Event</th>
                  <th className="py-3.5 px-5">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9F9FA]/80">
                    <td className="py-3.5 px-5 tabular-nums text-[#6E6E73] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#F1F1F2] flex items-center justify-center font-bold text-[10px] text-[#0B0B0C]">
                          <User className="w-3 h-3 text-[#2F6BFF]" />
                        </span>
                        <div>
                          <div className="font-semibold text-[#0B0B0C]">{log.user}</div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/5 text-[#6E6E73]">
                            {log.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#0B0B0C]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-5 text-[#6E6E73] max-w-sm leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
