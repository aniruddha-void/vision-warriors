import { Customer, CustomerCategory, CategoryThresholds } from '../types/index.js';

export const defaultCategoryThresholds: CategoryThresholds = {
  newMaxVisits: 2,
  regularMinVisits30Days: 3,
  regularMaxLastVisitDays: 14,
  irregularMinLastVisitDays: 21,
  attentionMinDays: 14,
  attentionMaxDays: 21,
};

export interface ClassificationResult {
  category: CustomerCategory;
  needsAttention: boolean;
  reason: string;
}

export function classify(
  customer: Pick<Customer, 'visitCount' | 'lastVisitDaysAgo' | 'visitsPerMonth'>,
  thresholds: CategoryThresholds = defaultCategoryThresholds
): ClassificationResult {
  const { visitCount, lastVisitDaysAgo, visitsPerMonth } = customer;

  // NEW: total visits <= 2
  if (visitCount <= thresholds.newMaxVisits) {
    return {
      category: 'NEW',
      needsAttention: false,
      reason: `First-time or recent visitor with ${visitCount} total visit${visitCount > 1 ? 's' : ''}.`,
    };
  }

  // IRREGULAR: last visit older than 21 days
  if (lastVisitDaysAgo >= thresholds.irregularMinLastVisitDays) {
    return {
      category: 'IRREGULAR',
      needsAttention: false,
      reason: `Not seen in ${lastVisitDaysAgo} days. Prior cadence dropped.`,
    };
  }

  // REGULAR: 3+ visits in last 30 days AND last visit within 14 days
  if (
    visitsPerMonth >= thresholds.regularMinVisits30Days &&
    lastVisitDaysAgo <= thresholds.regularMaxLastVisitDays
  ) {
    return {
      category: 'REGULAR',
      needsAttention: false,
      reason: `Frequent guest: ${visitsPerMonth} visits/mo, visited ${lastVisitDaysAgo} day${lastVisitDaysAgo > 1 ? 's' : ''} ago.`,
    };
  }

  // Needs attention window: 14 to 21 days gap
  if (
    lastVisitDaysAgo >= thresholds.attentionMinDays &&
    lastVisitDaysAgo < thresholds.attentionMaxDays
  ) {
    return {
      category: 'REGULAR',
      needsAttention: true,
      reason: `At border: ${lastVisitDaysAgo} days since last visit. Re-engagement recommended.`,
    };
  }

  // Fallback category
  return {
    category: 'REGULAR',
    needsAttention: false,
    reason: `Steady neighborhood patron with ${visitsPerMonth} monthly visits.`,
  };
}

export function evaluateOfferEligibility(
  customer: Customer,
  targetCategory: CustomerCategory,
  channel: 'whatsapp' | 'sms' | 'email',
  thresholds: CategoryThresholds = defaultCategoryThresholds
): { eligible: boolean; exclusionReason?: string } {
  // Master consent check
  if (!customer.consent.personalisedOffers) {
    return { eligible: false, exclusionReason: 'Personalised offers turned off by customer' };
  }

  // Category match
  const currentClassification = classify(customer, thresholds);
  if (currentClassification.category !== targetCategory) {
    return { eligible: false, exclusionReason: `Belongs to ${currentClassification.category}, not ${targetCategory}` };
  }

  // Channel consent check
  if (!customer.consent.channels[channel]) {
    return { eligible: false, exclusionReason: `Customer has not consented to ${channel.toUpperCase()} messages` };
  }

  // Purpose-specific offer consent check
  if (channel === 'email' && customer.consent.emailOffers === false) {
    return { eligible: false, exclusionReason: 'Customer has disabled promotional email offers' };
  }
  if (channel === 'sms' && customer.consent.smsOffers === false) {
    return { eligible: false, exclusionReason: 'Customer has disabled SMS promotional offers' };
  }

  // Contact existence
  if (channel === 'email' && !customer.email) {
    return { eligible: false, exclusionReason: 'No email address on file' };
  }
  if ((channel === 'sms' || channel === 'whatsapp') && !customer.phone) {
    return { eligible: false, exclusionReason: 'No phone number on file' };
  }

  return { eligible: true };
}
