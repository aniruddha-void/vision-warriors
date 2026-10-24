import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Users, Gift, IndianRupee, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  // Mock weekly footfall before and after actions
  const impactData = [
    { week: 'W1 (Baseline)', returnVisits: 42, generalFootfall: 110, revenue: 32000 },
    { week: 'W2 (Action launch)', returnVisits: 58, generalFootfall: 125, revenue: 37800 },
    { week: 'W3 (Bun Maska drive)', returnVisits: 76, generalFootfall: 142, revenue: 43500 },
    { week: 'W4 (Current week)', returnVisits: 94, generalFootfall: 168, revenue: 51200 },
  ];

  const channelPerformance = [
    { channel: 'WhatsApp', sent: 118, opened: 104, redeemed: 48 },
    { channel: 'SMS', sent: 32, opened: 26, redeemed: 11 },
    { channel: 'Email', sent: 40, opened: 28, redeemed: 9 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Impact tracker
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Measurable results from explainable actions without privacy intrusion.
          </p>
        </div>

        <div className="text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Zero third-party tracking pixels used</span>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Customers returned */}
        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
              Customers returned
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#0B0B0C] tabular-nums tracking-tight">
            52 patrons
          </div>
          <div className="text-xs text-[#22C55E] mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24% over last month baseline</span>
          </div>
        </div>

        {/* Card 2: Offers redeemed */}
        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
              Offers redeemed
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#0B0B0C] tabular-nums tracking-tight">
            68 vouchers
          </div>
          <div className="text-xs text-[#6E6E73] mt-2">
            Highest redemption: Bun Maska welcome back
          </div>
        </div>

        {/* Card 3: Estimated revenue uplift */}
        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
              Estimated revenue uplift
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#0B0B0C] tabular-nums tracking-tight">
            ₹19,200
          </div>
          <div className="text-xs text-[#22C55E] mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Incremental sales from action triggers</span>
          </div>
        </div>

      </div>

      {/* Main Before / After Chart */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">
              Customer attendance trajectory
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Comparison of baseline visits versus post-action customer footfall.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2F6BFF]" />
              <span className="text-[#3A3A3D]">Re-engaged patrons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1EC0FF]" />
              <span className="text-[#3A3A3D]">Total shop footfall</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={impactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F2" vertical={false} />
              <XAxis dataKey="week" stroke="#9A9A9E" fontSize={12} tickLine={false} />
              <YAxis stroke="#9A9A9E" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0B0C',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Line
                type="monotone"
                dataKey="returnVisits"
                stroke="#2F6BFF"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2F6BFF' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="generalFootfall"
                stroke="#1EC0FF"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1EC0FF' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Redemption Breakdown */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <h2 className="text-lg font-semibold text-[#0B0B0C] mb-1">
          Redemption breakdown by channel
        </h2>
        <p className="text-xs text-[#6E6E73] mb-6">
          Shows where patrons prefer to engage. Only opted-in channels are contacted.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F2" vertical={false} />
              <XAxis dataKey="channel" stroke="#9A9A9E" fontSize={12} tickLine={false} />
              <YAxis stroke="#9A9A9E" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0B0C',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="sent" fill="#E5E5EA" radius={[6, 6, 0, 0]} name="Messages Sent" />
              <Bar dataKey="opened" fill="#1EC0FF" radius={[6, 6, 0, 0]} name="Read / Opened" />
              <Bar dataKey="redeemed" fill="#22C55E" radius={[6, 6, 0, 0]} name="Offers Redeemed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
