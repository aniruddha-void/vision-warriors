import React from 'react';
import { PillBadge } from '../ui/PillBadge';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '₹0',
      period: 'forever free',
      description: 'Ideal for single-location neighborhood cafes getting started.',
      features: [
        'Up to 100 customer records',
        '3 core segments (Regulars, New, At-risk)',
        'Built-in QR consent manager',
        'Automatic fallback mode',
        'WhatsApp & SMS message copy',
      ],
      popular: false,
      buttonText: 'Start for free',
      buttonVariant: 'ghost',
    },
    {
      name: 'Growth',
      price: '₹1,999',
      period: 'per month',
      description: 'Everything a thriving local food & beverage business needs.',
      features: [
        'Up to 1,500 customer records',
        'Unlimited explainable action cards',
        'Detailed feature contribution bars',
        'Automated consent audit logs',
        'One-click JSON customer export',
        'Custom menu pairing recommendations',
      ],
      popular: true,
      buttonText: 'Get Growth demo',
      buttonVariant: 'primary',
    },
    {
      name: 'Pro',
      price: '₹4,499',
      period: 'per month',
      description: 'Multi-outlet shops requiring dedicated privacy guarantees.',
      features: [
        'Up to 10,000 customers across outlets',
        'Custom segmentation rules & weights',
        'Staff role-based privacy access',
        'Automated data purge scheduler',
        'Priority phone & WhatsApp support',
      ],
      popular: false,
      buttonText: 'Contact sales',
      buttonVariant: 'ghost',
    },
  ];

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <PillBadge dotColor="#2F6BFF" className="mb-4">
          Pricing
        </PillBadge>
        <h2 className="text-[34px] sm:text-[46px] lg:text-[50px] font-medium text-[#0B0B0C] tracking-tight leading-[1.12]">
          Simple, honest pricing for your shop
        </h2>
        <p className="mt-4 text-[17px] text-[#6E6E73]">
          No hidden lock-ins. Every plan includes full consent management and zero trackers.
        </p>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[28px] p-8 flex flex-col justify-between transition-all relative ${
              plan.popular
                ? 'bg-white border-2 border-[#2F6BFF] shadow-[0_16px_40px_rgba(47,107,255,0.12)]'
                : 'bg-white border border-black/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2F6BFF] text-white text-[12px] font-semibold tracking-wide shadow-sm">
                Most popular
              </div>
            )}

            <div>
              <div className="text-xl font-semibold text-[#0B0B0C] mb-2">{plan.name}</div>
              <p className="text-xs text-[#6E6E73] min-h-[36px] mb-6">{plan.description}</p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl font-bold text-[#0B0B0C] tracking-tight tabular-nums">
                  {plan.price}
                </span>
                <span className="text-xs text-[#6E6E73]">/ {plan.period}</span>
              </div>

              <div className="space-y-3 pt-6 border-t border-black/[0.06]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-2">
                  What is included:
                </div>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[#3A3A3D]">
                    <div className="w-4 h-4 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-6">
              <button
                onClick={() => navigate('/app')}
                className={`w-full h-[46px] rounded-[12px] font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  plan.popular
                    ? 'bg-[#2F6BFF] hover:bg-[#1F58E6] text-white shadow-sm'
                    : 'bg-white border border-black/[0.12] hover:border-black/[0.22] text-[#0B0B0C] hover:bg-[#F9F9FA]'
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
