export type UserRole = 'owner' | 'manager' | 'staff' | 'auditor' | 'customer';

export type CustomerCategory = 'NEW' | 'REGULAR' | 'IRREGULAR';

export interface ConsentChannels {
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
}

export interface CustomerConsent {
  purchaseHistory: boolean;
  visitFrequency: boolean;
  emailOffers: boolean;
  smsOffers: boolean;
  location: boolean;
  personalisedOffers: boolean;
  channels: ConsentChannels;
  updatedAt: string;
}

export interface Customer {
  id: string; // e.g. "C-1001"
  shopId?: string;
  name: string;
  phone: string;
  email: string;
  firstVisit: string;
  lastVisit: string;
  lastVisitDaysAgo: number;
  visitCount: number;
  visitsPerMonth: number;
  avgSpend: number;
  favouriteCategory: string;
  preferredChannel: 'whatsapp' | 'sms' | 'email';
  consent: CustomerConsent;
  category: CustomerCategory;
  needsAttention?: boolean;
}

export interface Visit {
  id: string;
  shopId?: string;
  customerId: string;
  date: string;
  review?: string;
  rating?: number;
  spend?: number;
}

export interface SentOfferRecord {
  id: string;
  shopId?: string;
  customerId: string;
  type: 'welcome' | 'loyalty' | 'winback';
  category: CustomerCategory;
  channel: 'whatsapp' | 'sms' | 'email';
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Redeemed';
  title: string;
  discount: string;
}

export interface ReviewItem {
  id: string;
  shopId?: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FeatureContribution {
  name: string;
  weight: number;
  explanation: string;
}

export type ActionCategory = 'Win-back' | 'Upsell' | 'Welcome' | 'Loyalty' | 'Feedback' | 'Weekend special';

export interface NextBestAction {
  id: string;
  shopId?: string;
  title: string;
  category: ActionCategory;
  segmentId: string;
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
}

export interface TaskItem {
  id: string;
  shopId?: string;
  title: string;
  actionId?: string;
  channel: 'whatsapp' | 'sms' | 'email';
  customerCount: number;
  dueTime: string;
  completed: boolean;
  segmentName: string;
}

export interface MessageTemplate {
  id: string;
  shopId?: string;
  title: string;
  goal: string;
  channel: 'whatsapp' | 'sms' | 'email';
  content: string;
  variables: string[];
}

export interface ConsentLogEvent {
  id: string;
  shopId?: string;
  customerId: string;
  eventType: 'Granted' | 'Updated' | 'Withdrawn' | 'Data Exported' | 'Data Deleted';
  timestamp: string;
  purposes: string[];
  channels: string[];
  details: string;
}

export interface AuditLogEvent {
  id: string;
  shopId?: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface CategoryThresholds {
  newMaxVisits: number;
  regularMinVisits30Days: number;
  regularMaxLastVisitDays: number;
  irregularMinLastVisitDays: number;
  attentionMinDays: number;
  attentionMaxDays: number;
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
  categoryThresholds: CategoryThresholds;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  shopId: string;
  isDemo?: boolean;
}

