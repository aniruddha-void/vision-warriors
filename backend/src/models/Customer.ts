import mongoose, { Schema, Document } from 'mongoose';
import { Customer } from '../types/index.js';

export interface ICustomerDoc extends Document, Omit<Customer, 'id'> {
  id: string;
}

const ConsentChannelSchema = new Schema(
  {
    whatsapp: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
  },
  { _id: false }
);

const CustomerConsentSchema = new Schema(
  {
    purchaseHistory: { type: Boolean, default: true },
    visitFrequency: { type: Boolean, default: true },
    emailOffers: { type: Boolean, default: false },
    smsOffers: { type: Boolean, default: false },
    location: { type: Boolean, default: false },
    personalisedOffers: { type: Boolean, default: true },
    channels: { type: ConsentChannelSchema, default: () => ({}) },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomerDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', index: true },
    email: { type: String, default: '', lowercase: true, trim: true, index: true },
    firstVisit: { type: String, required: true },
    lastVisit: { type: String, required: true },
    lastVisitDaysAgo: { type: Number, default: 0 },
    visitCount: { type: Number, default: 1 },
    visitsPerMonth: { type: Number, default: 1 },
    avgSpend: { type: Number, default: 250 },
    favouriteCategory: { type: String, default: 'Masala Chai' },
    preferredChannel: { type: String, enum: ['whatsapp', 'sms', 'email'], default: 'whatsapp' },
    consent: { type: CustomerConsentSchema, required: true },
    category: { type: String, enum: ['NEW', 'REGULAR', 'IRREGULAR'], default: 'NEW' },
    needsAttention: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CustomerSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const CustomerModel = mongoose.model<ICustomerDoc>('Customer', CustomerSchema);

