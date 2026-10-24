import mongoose, { Schema, Document } from 'mongoose';
import { TaskItem, NextBestAction, MessageTemplate } from '../types/index.js';

// --- Task Model ---
export interface ITaskDoc extends Document, Omit<TaskItem, 'id'> {
  id: string;
}

const TaskSchema = new Schema<ITaskDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    title: { type: String, required: true },
    actionId: { type: String },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email'], required: true },
    customerCount: { type: Number, default: 0 },
    dueTime: { type: String, required: true },
    completed: { type: Boolean, default: false },
    segmentName: { type: String, required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const TaskModel = mongoose.model<ITaskDoc>('Task', TaskSchema);

// --- Action Model ---
export interface IActionDoc extends Document, Omit<NextBestAction, 'id'> {
  id: string;
}

const FeatureContributionSchema = new Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const ActionSchema = new Schema<IActionDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Win-back', 'Upsell', 'Welcome', 'Loyalty', 'Feedback', 'Weekend special'],
      required: true,
    },
    segmentId: { type: String, required: true },
    segmentName: { type: String, required: true },
    expectedResult: { type: String, required: true },
    effort: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email', 'omnichannel'], default: 'whatsapp' },
    confidence: { type: Number, required: true },
    reason: { type: String, required: true },
    featureContributions: [FeatureContributionSchema],
    dataUsed: [{ type: String }],
    dataNotUsed: [{ type: String }],
    dueTime: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    templateMessage: {
      whatsapp: { type: String, default: '' },
      sms: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

ActionSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const ActionModel = mongoose.model<IActionDoc>('Action', ActionSchema);

// --- Message Template Model ---
export interface ITemplateDoc extends Document, Omit<MessageTemplate, 'id'> {
  id: string;
}

const TemplateSchema = new Schema<ITemplateDoc>(
  {
    id: { type: String, required: true, index: true },
    shopId: { type: String, required: true, default: 'chai-and-co', index: true },
    title: { type: String, required: true },
    goal: { type: String, required: true },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email'], required: true },
    content: { type: String, required: true },
    variables: [{ type: String }],
  },
  { timestamps: true }
);

TemplateSchema.index({ shopId: 1, id: 1 }, { unique: true });

export const TemplateModel = mongoose.model<ITemplateDoc>('Template', TemplateSchema);

