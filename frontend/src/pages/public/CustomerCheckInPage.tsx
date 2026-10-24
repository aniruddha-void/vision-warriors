import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { Logo } from '../../components/ui/Logo';
import { Star, ShieldCheck, Check, Sparkles, ArrowRight, AlertCircle, Coffee } from 'lucide-react';

export const CustomerCheckInPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { settings, addCheckIn } = useNovaStore();

  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [consentGranted, setConsentGranted] = useState(true);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [error, setError] = useState('');

  const validateInput = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter your mobile number or email address.');
      return false;
    }

    if (trimmed.includes('@')) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setError('Please enter a valid email address (e.g., name@example.com).');
        return false;
      }
    } else {
      // Phone validation (digits only, at least 10 digits)
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput(contact)) return;

    const result = addCheckIn({
      contact,
      name,
      rating: showReviewInput ? rating : undefined,
      review: showReviewInput ? review : undefined,
      consentGranted,
    });

    navigate('/thanks', {
      state: {
        customerId: result.customer.id,
        customerName: result.customer.name,
        isNew: result.isNew,
        visitCount: result.customer.visitCount,
        category: result.customer.category,
        shopName: settings.shopName,
      },
    });
  };

  return (
    <div className="min-h-screen bg-dotted-pattern flex flex-col justify-center items-center px-4 py-8">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-[20px] bg-white border border-black/[0.08] shadow-sm flex items-center justify-center mx-auto mb-3">
          <Coffee className="w-7 h-7 text-[#2F6BFF]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B0B0C] tracking-tight">
          {settings.shopName}
        </h1>
        <p className="text-xs text-[#6E6E73] mt-1">
          Counter check-in &bull; 4th Avenue Flagship Cafe
        </p>
      </div>

      {/* Main Check-In Card */}
      <div className="w-full max-w-md bg-white rounded-[32px] border border-black/[0.08] shadow-[0_16px_44px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Earn stamps & secret discounts</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B0B0C]">
            Quick patron check-in
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">
            Enter your mobile or email. We will track your visits and suggest personalized rewards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Contact Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1.5">
              Phone number or email *
            </label>
            <input
              type="text"
              placeholder="e.g. 98201 10001 or you@gmail.com"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (error) setError('');
              }}
              className="w-full h-12 px-4 rounded-[14px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-sm text-[#0B0B0C] outline-none transition-all placeholder:text-[#9A9A9E]"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-[#EF4444] mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Optional Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A3A3D] mb-1.5">
              Your name <span className="text-[#9A9A9E] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Aarav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-[14px] bg-[#F9F9FA] border border-black/[0.1] focus:border-[#2F6BFF] focus:bg-white text-sm text-[#0B0B0C] outline-none transition-all placeholder:text-[#9A9A9E]"
            />
          </div>

          {/* Optional Review Drawer Toggle */}
          <div className="pt-1">
            {!showReviewInput ? (
              <button
                type="button"
                onClick={() => setShowReviewInput(true)}
                className="text-xs text-[#2F6BFF] font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Leave a rating or review for today's cup?</span>
              </button>
            ) : (
              <div className="p-4 rounded-[18px] bg-[#F9F9FA] border border-black/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0B0B0C]">
                    Rate your experience
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'text-[#F59E0B] fill-[#F59E0B]'
                              : 'text-[#D1D1D6]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="How was your chai, snack or service today?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full p-2.5 rounded-[10px] bg-white border border-black/[0.08] text-xs text-[#0B0B0C] outline-none"
                />
              </div>
            )}
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-[16px] bg-[#F1F1F2]/80 border border-black/[0.05] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="w-4 h-4 rounded text-[#2F6BFF] focus:ring-[#2F6BFF] border-black/[0.2] shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="text-xs text-[#3A3A3D] leading-relaxed">
                I agree to receive personalized offers by email or SMS from Chai & Co. I can manage or withdraw consent any time.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-[48px] rounded-[14px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-semibold text-sm transition-all shadow-[0_4px_16px_rgba(47,107,255,0.25)] flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <span>Submit check-in</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-[#6E6E73]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Privacy guaranteed
          </span>
          <Link to="/privacy" className="text-[#2F6BFF] hover:underline">
            Our data promise
          </Link>
        </div>

      </div>

      <div className="mt-6 text-center text-xs text-[#6E6E73]">
        Are you the shop owner?{' '}
        <Link to="/login" className="text-[#2F6BFF] font-medium hover:underline">
          Go to retailer app
        </Link>
      </div>

    </div>
  );
};
