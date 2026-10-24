import { Customer, CustomerCategory, CategoryThresholds, CategoryOfferConfig } from '../types';

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
  customer: Customer,
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
      reason: `At border: ${lastVisitDaysAgo} days since last visit. Re-engagement recommended before lapsing.`,
    };
  }

  // Fallback category
  return {
    category: 'REGULAR',
    needsAttention: false,
    reason: `Steady neighborhood patron with ${visitsPerMonth} monthly visits.`,
  };
}

export const categoryOfferConfigs: Record<CustomerCategory, CategoryOfferConfig> = {
  NEW: {
    category: 'NEW',
    name: 'New customers',
    headline: 'Welcome discount',
    discountText: '10% off next visit',
    suggestedOffer: 'Welcome 10% coupon on handcrafted tea & pastry duo',
    validity: 'Valid for 14 days',
    reason: 'New patrons who return within 10 days of their initial cup are 3.8x more likely to develop a steady weekly cafe habit.',
    featureContributions: [
      { name: 'Recent initial check-in (last 7 days)', weight: 52, explanation: 'Immediate welcome message maximizes second-visit retention.' },
      { name: 'Palate exploration baseline', weight: 26, explanation: 'Initial beverage ordered indicates flavor profile preference.' },
      { name: 'Time of check-in', weight: 14, explanation: 'Matches morning commute or afternoon break slot.' },
      { name: 'Opted-in channel preference', weight: 8, explanation: 'Direct response channel.' },
    ],
    dataUsed: ['Recent check-in timestamp', 'Channel preference (consented)'],
    dataNotUsed: ['GPS coordinates (strictly prohibited)', 'Device identifiers', 'Payment cards'],
    templateMessage: {
      email: 'Subject: Welcome to the Chai & Co family! ☕\n\nHi {first_name},\n\nThank you for stopping by Chai & Co. We would love to brew your next cup: take 10% off your entire next order with code {discount}.\n\nValid till {valid_till}.\n\nWarmly,\nAmanda & team Chai & Co',
      sms: 'Chai & Co: Welcome {first_name}! Enjoy 10% off your next visit with code {discount}. Valid till {valid_till}. Show at counter.',
      whatsapp: 'Welcome to Chai & Co, {first_name}! 🌟 Thanks for dropping in. Enjoy 10% off your next cup with voucher code {discount}. Valid till {valid_till}!',
    },
  },
  REGULAR: {
    category: 'REGULAR',
    name: 'Regulars',
    headline: 'Loyalty reward',
    discountText: 'Free item on 5th visit',
    suggestedOffer: 'Complimentary Maska Bun or Chef snack on next milestone',
    validity: 'Valid every month',
    reason: 'Regulars drive 62% of weekday revenue. Acknowledging their attendance streak sustains emotional loyalty without relying on deep margin cuts.',
    featureContributions: [
      { name: 'Monthly visit frequency (3+ visits)', weight: 48, explanation: 'Consistent attendance confirms regular status.' },
      { name: 'Tenure & streak reliability', weight: 32, explanation: 'Stable weekly cadence across last 30 days.' },
      { name: 'Favorite order accompaniment', weight: 12, explanation: 'Pairing sweet or savory baked goods with tea.' },
      { name: 'Advocacy affinity', weight: 8, explanation: 'Likelihood to recommend Chai & Co to friends.' },
    ],
    dataUsed: ['Monthly visit frequency', 'Milestone visit counter (consented)'],
    dataNotUsed: ['Location history', 'Social graph', 'Personal identifiers'],
    templateMessage: {
      email: 'Subject: A treat on us for being one of our best! 🍵\n\nDear {first_name},\n\nYou make Chai & Co feel vibrant every week. On your next visit, enjoy a complimentary Bun Maska or handcrafted snack on the house with code {discount}.\n\nCheers,\nTeam Chai & Co',
      sms: 'Chai & Co VIP: {first_name}, thank you for your loyalty! Enjoy a free Bun Maska on your next visit with code {discount}. See you soon!',
      whatsapp: 'Hey {first_name}! 🍵 You are one of Chai & Co’s most beloved regulars. Your next visit unlocks a complimentary Bun Maska on us! Show code: {discount}.',
    },
  },
  IRREGULAR: {
    category: 'IRREGULAR',
    name: 'Irregular / At-risk',
    headline: 'Win-back discount',
    discountText: '20% off (valid 7 days)',
    suggestedOffer: '20% re-activation voucher on favorite hot brew & snack',
    validity: 'Valid 7 days',
    reason: 'These patrons previously visited regularly but have not checked in for 21+ days. A time-limited, warm personal offer creates an immediate incentive to return.',
    featureContributions: [
      { name: 'Recency gap (21+ days since last visit)', weight: 45, explanation: 'Strongest indicator of churn risk.' },
      { name: 'Historical visit volume', weight: 28, explanation: 'High previous attendance proves product-market fit.' },
      { name: 'Favorite menu category affinity', weight: 18, explanation: 'Masala Chai and savory rolls convert highest.' },
      { name: 'Margin preservation threshold', weight: 9, explanation: '20% discount remains profitable on average ticket.' },
    ],
    dataUsed: ['Days since last visit', 'Historical visit volume (consented)'],
    dataNotUsed: ['Home/work location coordinates', 'Browsing tracking', 'Third-party cookies'],
    templateMessage: {
      email: 'Subject: We saved your favorite table at Chai & Co ☕\n\nHi {first_name},\n\nWe noticed it has been a little while! We miss seeing you around 4th Avenue. Drop by this week and take 20% off your entire bill with code {discount}.\n\nValid till {valid_till}.\n\nWarm regards,\nChai & Co Kitchen',
      sms: 'Chai & Co: We miss you {first_name}! Enjoy 20% off your next visit this week with code {discount}. Valid till {valid_till}.',
      whatsapp: 'Hi {first_name}! ☕ We missed seeing you at Chai & Co. Your favorite brew is waiting! Enjoy 20% off this week with code {discount}. Valid till {valid_till}.',
    },
  },
};

export function getCategoryBreakdown(
  customers: Customer[],
  thresholds: CategoryThresholds = defaultCategoryThresholds
) {
  const list = customers.map((c) => ({
    customer: c,
    ...classify(c, thresholds),
  }));

  const newCustomers = list.filter((item) => item.category === 'NEW');
  const regularCustomers = list.filter((item) => item.category === 'REGULAR');
  const irregularCustomers = list.filter((item) => item.category === 'IRREGULAR');
  const needsAttention = list.filter((item) => item.needsAttention);

  return {
    newCustomers,
    regularCustomers,
    irregularCustomers,
    needsAttention,
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

  // Contact existence
  if (channel === 'email' && !customer.email) {
    return { eligible: false, exclusionReason: 'No email address on file' };
  }
  if ((channel === 'sms' || channel === 'whatsapp') && !customer.phone) {
    return { eligible: false, exclusionReason: 'No phone number on file' };
  }

  return { eligible: true };
}

export function getSegmentMembers(customers: Customer[], segmentId: 'regulars' | 'new' | 'at-risk' | 'high-spenders') {
  const eligibleCustomers: Customer[] = [];
  const excludedCustomers: { customer: Customer; reason: string }[] = [];
  let totalMatchingRule = 0;

  customers.forEach((customer) => {
    let rawRuleMatch = false;
    if (segmentId === 'regulars') {
      rawRuleMatch = customer.visitsPerMonth >= 8 && customer.lastVisitDaysAgo <= 14;
    } else if (segmentId === 'new') {
      rawRuleMatch = customer.visitsPerMonth <= 2 && customer.lastVisitDaysAgo <= 7;
    } else if (segmentId === 'at-risk') {
      rawRuleMatch = customer.visitsPerMonth >= 3 && customer.lastVisitDaysAgo >= 21;
    } else if (segmentId === 'high-spenders') {
      rawRuleMatch = customer.avgSpend >= 450;
    }

    if (rawRuleMatch) {
      totalMatchingRule++;
      if (!customer.consent.personalisedOffers) {
        excludedCustomers.push({ customer, reason: 'Personalised offers turned off' });
      } else if (segmentId === 'high-spenders' && !customer.consent.purchaseHistory) {
        excludedCustomers.push({ customer, reason: 'Purchase history not consented' });
      } else if (!customer.consent.visitFrequency) {
        excludedCustomers.push({ customer, reason: 'Visit frequency not consented' });
      } else {
        eligibleCustomers.push(customer);
      }
    }
  });

  return {
    segmentId,
    eligibleCustomers,
    excludedCustomers,
    totalMatchingRule,
  };
}

export function getExcludedCountForAction(customers: Customer[], segmentId: string): number {
  if (segmentId === 'all') return 0;
  const res = getSegmentMembers(customers, segmentId as any);
  return res.excludedCustomers.length;
}

