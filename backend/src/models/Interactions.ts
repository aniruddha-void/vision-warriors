import mongoose, { Schema, Document } from 'mongoose';
import { Visit, ReviewItem, SentOfferRecord } from '../types/index.js';

// --- Visit Model ---
export interface IVisitDoc extends Document, Omit<Visit, 'id'> {
  id: string;
}

const VisitSchema = new Schema<IVisitDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    customerId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    review: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    spend: { type: Number },
  },
  { timestamps: true }
);

VisitSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const VisitModel = mongoose.model<IVisitDoc>('Visit', VisitSchema);

// --- Review Model ---
export interface IReviewDoc extends Document, Omit<ReviewItem, 'id'> {
  id: string;
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReviewDoc>('Review', ReviewSchema);

// --- Sent Offer Model ---
export interface ISentOfferDoc extends Document, Omit<SentOfferRecord, 'id'> {
  id: string;
}

const SentOfferSchema = new Schema<ISentOfferDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    customerId: { type: String, required: true, index: true },
    type: { type: String, enum: ['welcome', 'loyalty', 'winback'], required: true },
    category: { type: String, enum: ['NEW', 'REGULAR', 'IRREGULAR'], required: true },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email'], required: true },
    sentAt: { type: String, required: true },
    status: { type: String, enum: ['Sent', 'Delivered', 'Redeemed'], default: 'Sent' },
    title: { type: String, required: true },
    discount: { type: String, required: true },
  },
  { timestamps: true }
);

SentOfferSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const SentOfferModel = mongoose.model<ISentOfferDoc>('SentOffer', SentOfferSchema);

