import React from 'react';
import { PillBadge } from '../ui/PillBadge';
import { QrCode, Smartphone, Users, Send, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Scan QR at counter',
      icon: QrCode,
      description: 'Customer scans the printed standee at your cafe counter with their phone camera. No mobile app download required.',
    },
    {
      number: '02',
      title: 'Instant check-in',
      icon: Smartphone,
      description: 'Customer inputs their phone or email and chooses their consent preference. First visit or return is detected instantly.',
    },
    {
      number: '03',
      title: 'Automatic classification',
      icon: Users,
      description: 'Nova automatically classifies the customer as New, Regular, or Irregular based on your visit frequency thresholds.',
    },
    {
      number: '04',
      title: 'Send explainable offers',
      icon: Send,
      description: 'Trigger tailored discount boosters (10% welcome, loyalty free item, or 20% win-back) sent strictly to consented patrons.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <PillBadge dotColor="#2F6BFF" className="mb-4">
          How It Works
        </PillBadge>
        <h2 className="text-[34px] sm:text-[46px] lg:text-[50px] font-medium text-[#0B0B0C] tracking-tight leading-[1.12]">
          From QR scan to repeat regular in 4 steps
        </h2>
        <p className="mt-4 text-[17px] text-[#6E6E73]">
          Simple for patrons, effortless for your staff, and 100% privacy compliant.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="rounded-[28px] bg-white border border-black/[0.08] p-7 shadow-xs flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#F1F1F2] text-[#2F6BFF]">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-[14px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0B0B0C] mb-2 leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-black/[0.05] flex items-center text-[11px] font-semibold text-[#2F6BFF]">
                <span>Step {idx + 1} of 4</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate('/checkin/chai-and-co')}
          className="h-11 px-6 rounded-[12px] bg-white border border-black/[0.12] hover:bg-[#F9F9FA] text-xs font-semibold text-[#0B0B0C] inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Try live counter check-in screen</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};
