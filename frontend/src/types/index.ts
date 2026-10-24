export type UserRole = 'owner' | 'manager' | 'staff' | 'auditor' | 'customer';

export type CustomerCategory = 'NEW' | 'REGULAR' | 'IRREGULAR';

export type ConsentChannels = {
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
};

export type CustomerConsent = {
  purchaseHistory: boolean;
  visitFrequency: boolean;
  emailOffers: boolean;
  smsOffers: boolean;
  location: boolean;
  personalisedOffers: boolean; // Master toggle
  channels: ConsentChannels;
  updatedAt: string;
};

export type Customer = {
  id: string; // e.g., "C-1001"
  name: string;
  phone: string;
  email: string;
  firstVisit: string;
  lastVisit: string;
  lastVisitDaysAgo: number;
  visitCount: number;
  visitsPerMonth: number;
  avgSpend: number; // in INR ₹
  favouriteCategory: string;
  preferredChannel: 'whatsapp' | 'sms' | 'email';
  consent: CustomerConsent;
  category: CustomerCategory;
  needsAttention?: boolean;
};

export type ConsentStatusType = 'Full' | 'Partial' | 'None';

export type Visit = {
  id: string;
  customerId: string;
  date: string;
  review?: string;
  rating?: number; // 1-5
  spend?: number;
};

export type SentOfferRecord = {
  id: string;
  customerId: string;
  type: 'welcome' | 'loyalty' | 'winback';
  category: CustomerCategory;
  channel: 'whatsapp' | 'sms' | 'email';
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Redeemed';
  title: string;
  discount: string;
};

export type ReviewItem = {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
};

export type SegmentId = 'regulars' | 'new' | 'at-risk' | 'high-spenders';

export type Segment = {
  id: SegmentId;
  name: string;
  description: string;
  ruleDescription: string;
  requiredConsent: ('purchaseHistory' | 'visitFrequency')[];
  color: string;
};

export type ActionCategory = 'Win-back' | 'Upsell' | 'Welcome' | 'Loyalty' | 'Feedback' | 'Weekend special';

export type NextBestAction = {
  id: string;
  title: string;
  category: ActionCategory;
  segmentId: SegmentId | 'all';
  segmentName: string;
  expectedResult: string;
  effort: 'Low' | 'Medium' | 'High';
  channel: 'whatsapp' | 'sms' | 'email' | 'omnichannel';
  confidence: number;
  reason: string;
  featureContributions: FeatureContribution[];
  dataUsed: string[];
  dataNotUsed: string[];
  dueTime: string;
  isCompleted?: boolean;
  templateMessage: {
    whatsapp: string;
    sms: string;
    email: string;
  };
};

export type FeatureContribution = {
  name: string;
  weight: number; // e.g. 45 for 45%
  explanation: string;
};

export type CategoryOfferConfig = {
  category: CustomerCategory;
  name: string;
  headline: string;
  discountText: string;
  suggestedOffer: string;
  validity: string;
  reason: string;
  featureContributions: FeatureContribution[];
  dataUsed: string[];
  dataNotUsed: string[];
  templateMessage: {
    email: string;
    sms: string;
    whatsapp: string;
  };
};

export type TaskItem = {
  id: string;
  title: string;
  actionId?: string;
  channel: 'whatsapp' | 'sms' | 'email';
  customerCount: number;
  dueTime: string;
  completed: boolean;
  segmentName: string;
};

export type MessageTemplate = {
  id: string;
  title: string;
  goal: string;
  channel: 'whatsapp' | 'sms' | 'email';
  content: string;
  variables: string[];
};

export type ConsentLogEvent = {
  id: string;
  customerId: string;
  eventType: 'Granted' | 'Updated' | 'Withdrawn' | 'Data Exported' | 'Data Deleted';
  timestamp: string;
  purposes: string[];
  channels: string[];
  details: string;
};

export type AuditLogEvent = {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
};

export interface CategoryThresholds {
  newMaxVisits: number; // <= 2
  regularMinVisits30Days: number; // >= 3
  regularMaxLastVisitDays: number; // <= 14
  irregularMinLastVisitDays: number; // >= 21
  attentionMinDays: number; // 14
  attentionMaxDays: number; // 21
}

export interface NovaSettings {
  shopId: string;
  shopName: string;
  dataMinimization: boolean;
  retentionPeriodMonths: number;
  defaultChannel: 'whatsapp' | 'sms' | 'email';
  privacyMode: boolean;
  demoMode: boolean;
  demoCustomerId: string;
  categoryThresholds?: CategoryThresholds;
}

