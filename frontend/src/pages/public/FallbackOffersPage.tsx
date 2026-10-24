import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { generalOffers } from '../../data/offers';
import { Sparkles, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FallbackOffersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Fallback Banner */}
        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[16px] bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#B45309] text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Fallback mode active
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#0B0B0C] tracking-tight">
                  Personalisation is off. Showing general offers for everyone.
                </h1>
                <p className="text-sm text-[#6E6E73] mt-1 max-w-xl">
                  These specials are computed strictly from anonymous aggregate store favorites. Zero customer-specific profiling or tracking data is used on this page.
                </p>
              </div>
            </div>

            <Link
              to="/consent/C-1002"
              className="w-full sm:w-auto h-[46px] px-6 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Turn on personalised offers</span>
            </Link>
          </div>
        </div>

        {/* Cafe Banner */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#0B0B0C]">
              Chai & Co &bull; Current House Specials
            </h2>
            <p className="text-sm text-[#6E6E73] mt-0.5">
              Available at our 4th Avenue Flagship Cafe for all guests.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>Anonymous Aggregate Mode</span>
          </div>
        </div>

        {/* 4 General Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {generalOffers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full text-[#0B0B0C]"
                    style={{ backgroundColor: offer.badgeBg }}
                  >
                    {offer.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#6E6E73] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{offer.timing}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-[#0B0B0C] mb-2 leading-snug">
                  {offer.title}
                </h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">
                  {offer.description}
                </p>
              </div>

              <div>
                <div className="p-3 rounded-[16px] bg-[#F6F6F7] border border-black/[0.04] mb-5 flex items-center gap-2.5 text-xs text-[#3A3A3D]">
                  <Users className="w-4 h-4 text-[#2F6BFF] shrink-0" />
                  <span>{offer.aggregateFact}</span>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#0B0B0C] tabular-nums">
                      {offer.price}
                    </span>
                    {offer.originalPrice && (
                      <span className="text-sm text-[#9A9A9E] line-through tabular-nums">
                        {offer.originalPrice}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-medium text-[#2F6BFF] flex items-center gap-1">
                    <span>Show code at counter</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom privacy info box */}
        <div className="rounded-[24px] bg-[#F1F1F2] border border-black/[0.06] p-6 text-center text-xs text-[#6E6E73]">
          <p>
            Notice: No cookies, pixels, or customer IDs were checked or stored to show these offers.
            You are browsing in standard anonymous public mode.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
};
