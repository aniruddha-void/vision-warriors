import React, { useState } from 'react';
import { PillBadge } from '../ui/PillBadge';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'What data does Nova Insights actually collect?',
      answer:
        'Only the operational details needed to run your cafe: how often a customer visits (visit frequency), rough time of attendance, and menu categories they enjoy (purchase history). We never collect GPS locations, health, religion, or any sensitive attributes. Data is only retained while consent remains active.',
    },
    {
      question: 'What happens when a customer says NO to consent?',
      answer:
        'Zero pressure, zero dark patterns. When a customer turns off personalised offers or opts out, they are immediately excluded from all customer segments and targeted outreach. Instead, your shop displays our general Fallback offers (like the popular Monsoon Chai & Pakoda combo) which rely purely on anonymous aggregate store numbers.',
    },
    {
      question: 'Can customers change their mind later or delete data?',
      answer:
        'Yes, anytime. Every customer has a private, mobile-first consent link (accessible via receipt or SMS). They can flip toggles on or off, click "Download my data" to inspect everything stored in plain JSON, or click "Delete my data" to instantly purge all their records from the database.',
    },
    {
      question: 'Do you sell data or use third-party analytics trackers?',
      answer:
        'Never. Nova Insights is strictly a private, self-contained business tool. There are no advertising SDKs, pixel trackers, or third-party data brokers. Your cafe owns its customer relationships 100%.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <PillBadge dotColor="#F59E0B" className="mb-4">
          Privacy FAQ
        </PillBadge>
        <h2 className="text-[34px] sm:text-[46px] font-medium text-[#0B0B0C] tracking-tight leading-[1.12]">
          Questions about privacy? We are transparent.
        </h2>
      </div>

      {/* Accordion list */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-[22px] bg-white border border-black/[0.07] overflow-hidden transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-[17px] font-semibold text-[#0B0B0C]">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full bg-[#F6F6F7] flex items-center justify-center text-[#6E6E73] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#2F6BFF]/10 text-[#2F6BFF]' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2]" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-[15px] text-[#6E6E73] leading-relaxed border-t border-black/[0.04]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
