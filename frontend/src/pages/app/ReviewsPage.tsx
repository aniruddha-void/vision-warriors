import React, { useState } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { Star, MessageSquare, ShieldCheck, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewsPage: React.FC = () => {
  const { reviews } = useNovaStore();
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === 'all') return true;
    return r.rating === ratingFilter;
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Patron reviews & satisfaction
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Voluntary ratings left by customers upon scanning the counter check-in QR code.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>100% genuine counter check-in reviews</span>
        </div>
      </div>

      {/* Average Rating Score Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 rounded-[22px] bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center shrink-0">
            <Star className="w-8 h-8 fill-[#F59E0B]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#0B0B0C] tabular-nums">
              {averageRating} <span className="text-sm text-[#6E6E73] font-normal">/ 5.0</span>
            </div>
            <div className="text-xs text-[#6E6E73] mt-0.5">
              Average rating ({reviews.length} total reviews)
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
            5-Star Reviews
          </span>
          <div className="text-2xl font-bold text-[#0B0B0C] tabular-nums">
            {reviews.filter((r) => r.rating === 5).length}
          </div>
          <div className="text-xs text-[#22C55E] font-medium">
            {(
              (reviews.filter((r) => r.rating === 5).length / (reviews.length || 1)) *
              100
            ).toFixed(0)}
            % of all reviews
          </div>
        </div>

        <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
            Recent Feedback Pulse
          </span>
          <div className="text-sm font-semibold text-[#0B0B0C]">
            Masala Chai & Bun Maska
          </div>
          <div className="text-xs text-[#6E6E73]">
            Most complimented item across ratings
          </div>
        </div>

      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setRatingFilter('all')}
          className={`h-9 px-4 rounded-[12px] text-xs font-medium transition-all shrink-0 cursor-pointer ${
            ratingFilter === 'all'
              ? 'bg-[#0B0B0C] text-white shadow-xs'
              : 'bg-white border border-black/[0.08] text-[#6E6E73]'
          }`}
        >
          All ratings ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((stars) => (
          <button
            key={stars}
            onClick={() => setRatingFilter(stars)}
            className={`h-9 px-4 rounded-[12px] text-xs font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              ratingFilter === stars
                ? 'bg-[#0B0B0C] text-white shadow-xs'
                : 'bg-white border border-black/[0.08] text-[#6E6E73]'
            }`}
          >
            <span>{stars} Stars</span>
            <Star className="w-3 h-3 fill-current text-[#F59E0B]" />
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-[24px] bg-white border border-black/[0.08] p-6 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F1F1F2] text-[#0B0B0C] font-semibold text-xs flex items-center justify-center">
                  {rev.customerName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#0B0B0C]">
                    {rev.customerName}
                  </div>
                  <Link
                    to={`/app/customers/${rev.customerId}`}
                    className="text-[11px] font-mono text-[#2F6BFF] hover:underline"
                  >
                    {rev.customerId}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 text-[#F59E0B]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                  ))}
                </div>
                <span className="text-xs text-[#9A9A9E] tabular-nums">{rev.date}</span>
              </div>
            </div>

            <p className="text-xs text-[#3A3A3D] leading-relaxed bg-[#F9F9FA] p-3.5 rounded-[16px] border border-black/[0.04] italic">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
