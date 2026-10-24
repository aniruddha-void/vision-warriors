import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PillBadge } from '../../components/ui/PillBadge';
import { ShieldCheck, Check, X, Trash2, Download, RefreshCw, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <PillBadge dotColor="#22C55E" className="mb-4">
            Privacy & Trust
          </PillBadge>
          <h1 className="text-[36px] sm:text-[48px] font-medium text-[#0B0B0C] tracking-tight leading-[1.08] mb-4">
            Our data promise to your customers
          </h1>
          <p className="text-[17px] text-[#6E6E73] leading-relaxed">
            Nova Insights was created on a radical premise: you do not need invasive surveillance to run a warm, profitable neighborhood business.
          </p>
        </div>

        {/* 2-Column Grid: What we use vs What we never use */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Card 1: What we use */}
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-[16px] bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#0B0B0C] mb-2">
              What we use (with consent)
            </h2>
            <p className="text-sm text-[#6E6E73] mb-6">
              Only the minimal operational signals required to deliver value.
            </p>

            <ul className="space-y-4 text-sm text-[#3A3A3D]">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-[#0B0B0C] block">Visit frequency</strong>
                  Days since last visit and approximate monthly visits to determine loyalty rewards.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-[#0B0B0C] block">Purchase categories</strong>
                  Broad beverage and food groups (e.g., Cold Brew, Bun Maska) for sensible pairings.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-[#0B0B0C] block">Contact channel choice</strong>
                  WhatsApp, SMS, or Email — only the channels you actively select.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: What we NEVER use */}
          <div className="rounded-[28px] bg-white border border-black/[0.08] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-[16px] bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#0B0B0C] mb-2">
              What we NEVER touch
            </h2>
            <p className="text-sm text-[#6E6E73] mb-6">
              Strictly prohibited from our data models, storage, and logic.
            </p>

            <ul className="space-y-4 text-sm text-[#3A3A3D]">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-[#0B0B0C] block">No GPS or live location tracking</strong>
                  We never ask for your location coordinates or track your movements outside the cafe.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-[#0B0B0C] block">No sensitive personal attributes</strong>
                  We never process health, religious, political, biometric, or financial credit data.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-[#0B0B0C] block">No third-party data brokers</strong>
                  We never buy, sell, or cross-reference your identity with Facebook, Google ads, or data aggregators.
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Your Rights & Controls */}
        <div className="rounded-[32px] bg-white border border-black/[0.08] p-8 sm:p-12 mb-16 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0B0B0C] mb-4">
            Your rights as a customer
          </h2>
          <p className="text-[16px] text-[#6E6E73] mb-8 max-w-2xl">
            You hold total control over your relationship with Chai & Co. These are not buried options; they are prominent 1-click tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-[20px] bg-[#F6F6F7] border border-black/[0.04]">
              <div className="w-10 h-10 rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#0B0B0C] mb-1">Update anytime</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Flip individual toggles on or off. Changes take effect on all cafe systems instantly.
              </p>
            </div>

            <div className="p-5 rounded-[20px] bg-[#F6F6F7] border border-black/[0.04]">
              <div className="w-10 h-10 rounded-[12px] bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#0B0B0C] mb-1">Download your data</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Export your full profile, visit counts, and preferences as an open JSON file in seconds.
              </p>
            </div>

            <div className="p-5 rounded-[20px] bg-[#F6F6F7] border border-black/[0.04]">
              <div className="w-10 h-10 rounded-[12px] bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#0B0B0C] mb-1">Delete permanently</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Exercise your right to be forgotten. Completely scrub your records with no questions asked.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-black/[0.06] flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs text-[#6E6E73]">
              Want to test the customer portal for yourself?
            </span>
            <Link
              to="/consent/C-1002"
              className="text-xs font-semibold text-[#2F6BFF] hover:underline"
            >
              Open Diya Patel's sample consent manager &rarr;
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
