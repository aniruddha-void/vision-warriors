import mongoose, { Schema, Document } from 'mongoose';
import { ConsentLogEvent, AuditLogEvent, NovaSettings } from '../types/index.js';

// --- Consent Log Model ---
export interface IConsentLogDoc extends Document, Omit<ConsentLogEvent, 'id'> {
  id: string;
}

const ConsentLogSchema = new Schema<IConsentLogDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    customerId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      enum: ['Granted', 'Updated', 'Withdrawn', 'Data Exported', 'Data Deleted'],
      required: true,
    },
    timestamp: { type: String, required: true },
    purposes: [{ type: String }],
    channels: [{ type: String }],
    details: { type: String, required: true },
  },
  { timestamps: true }
);

export const ConsentLogModel = mongoose.model<IConsentLogDoc>('ConsentLog', ConsentLogSchema);

// --- Audit Log Model ---
export interface IAuditLogDoc extends Document, Omit<AuditLogEvent, 'id'> {
  id: string;
}

const AuditLogSchema = new Schema<IAuditLogDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    timestamp: { type: String, required: true },
    user: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'manager', 'staff', 'auditor', 'customer'],
      required: true,
    },
    action: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.model<IAuditLogDoc>('AuditLog', AuditLogSchema);

// --- Settings Model ---
export interface ISettingsDoc extends Document, NovaSettings {}

const CategoryThresholdsSchema = new Schema(
  {
    newMaxVisits: { type: Number, default: 2 },
    regularMinVisits30Days: { type: Number, default: 3 },
    regularMaxLastVisitDays: { type: Number, default: 14 },
    irregularMinLastVisitDays: { type: Number, default: 21 },
    attentionMinDays: { type: Number, default: 14 },
    attentionMaxDays: { type: Number, default: 21 },
  },
  { _id: false }
);

const SettingsSchema = new Schema<ISettingsDoc>(
  {
    shopId: { type: String, required: true, unique: true, default: 'chai-and-co' },
    shopName: { type: String, required: true, default: 'Chai & Co' },
    dataMinimization: { type: Boolean, default: true },
    retentionPeriodMonths: { type: Number, default: 6 },
    defaultChannel: { type: String, enum: ['whatsapp', 'sms', 'email'], default: 'whatsapp' },
    privacyMode: { type: Boolean, default: true },
    demoMode: { type: Boolean, default: true },
    demoCustomerId: { type: String, default: 'C-1002' },
    categoryThresholds: { type: CategoryThresholdsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model<ISettingsDoc>('Settings', SettingsSchema);
