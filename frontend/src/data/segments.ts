import { Segment } from '../types';

export const segmentDefinitions: Segment[] = [
  {
    id: 'regulars',
    name: 'Regulars',
    description: 'Frequent visitors who love the cafe experience.',
    ruleDescription: 'Visited 8+ times this month and visited within the last 14 days',
    requiredConsent: ['visitFrequency'],
    color: '#2F6BFF',
  },
  {
    id: 'new',
    name: 'New customers',
    description: 'First-time or recent customers who visited in the last 7 days.',
    ruleDescription: 'Joined recently, 2 or fewer visits, visited within the last 7 days',
    requiredConsent: ['visitFrequency'],
    color: '#1EC7A0',
  },
  {
    id: 'at-risk',
    name: 'At-risk customers',
    description: 'Previously active visitors who have not visited in over 3 weeks.',
    ruleDescription: 'Had 3+ monthly visits but have not visited in the last 21+ days',
    requiredConsent: ['visitFrequency'],
    color: '#F59E0B',
  },
  {
    id: 'high-spenders',
    name: 'High spenders',
    description: 'High-value guests with average cafe spend of ₹450 or more.',
    ruleDescription: 'Average spend ₹450 or higher per visit',
    requiredConsent: ['purchaseHistory'],
    color: '#8B5CF6',
  },
];
