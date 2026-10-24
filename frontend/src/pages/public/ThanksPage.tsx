import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Sliders, ArrowRight, Coffee, Heart } from 'lucide-react';

export const ThanksPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    customerId?: string;
    customerName?: string;
    isNew?: boolean;
    visitCount?: number;
    category?: 'NEW' | 'REGULAR' | 'IRREGULAR';
    shopName?: string;
  } | null;

  const customerId = state?.customerId || 'C-1001';
  const customerName = state?.customerName || 'Friend';
  const isNew = state?.isNew ?? false;
  const visitCount = state?.visitCount ?? 1;
  const category = state?.category ?? 'NEW';
  const shopName = state?.shopName || 'Chai & Co';

  return (
    <div className="min-h-screen bg-dotted-pattern flex flex-col justify-center items-center px-4 py-12">
      
      <div className="w-full max-w-md bg-white rounded-[32px] border border-black/[0.08] shadow-[0_16px_44px_rgba(0,0,0,0.06)] p-8 sm:p-10 text-center">
        
        {/* Animated Green Badge */}
        <div className="w-16 h-16 rounded-[22px] bg-[#1EC7A0] text-white shadow-[0_12px_28px_rgba(30,199,160,0.35)] flex items-center justify-center mx-auto mb-6">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        {/* Dynamic Welcome Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B0B0C] tracking-tight mb-2">
          {isNew ? 'Welcome to Chai & Co!' : `Welcome back, ${customerName}!`}
        </h1>

        <p className="text-sm text-[#6E6E73] mb-6 leading-relaxed">
          {isNew
            ? 'Your first visit is recorded. Check your phone or inbox shortly for your 10% welcome booster!'
            : `Great to have you with us again! You have visited us ${visitCount} times.`}
        </p>

        {/* Patron Status Tile */}
        <div className="p-4 rounded-[20px] bg-[#F9F9FA] border border-black/[0.05] mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6E6E73]">Patron ID:</span>
            <span className="font-mono font-semibold text-[#0B0B0C]">{customerId}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6E6E73]">Classification Tier:</span>
            {category === 'NEW' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6EEFF] text-[#2F6BFF]">
                New Guest
              </span>
            )}
            {category === 'REGULAR' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E3F6EA] text-[#16A34A]">
                Regular Patron
              </span>
            )}
            {category === 'IRREGULAR' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF0D6] text-[#D97706]">
                Welcome Back
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6E6E73]">Total Visits:</span>
            <span className="font-semibold text-[#0B0B0C] tabular-nums">{visitCount} visits</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/consent/${customerId}`}
            className="w-full h-12 rounded-[14px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Manage my privacy choices</span>
          </Link>

          <Link
            to="/offers"
            className="w-full h-11 rounded-[14px] bg-white border border-black/[0.1] hover:bg-[#F9F9FA] text-[#0B0B0C] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Coffee className="w-4 h-4 text-[#F59E0B]" />
            <span>See today's cafe specials</span>
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-black/[0.05] text-xs text-[#6E6E73] flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#EF4444] fill-[#EF4444]" />
          <span>Brewed with love at {shopName}</span>
        </div>

      </div>

    </div>
  );
};
