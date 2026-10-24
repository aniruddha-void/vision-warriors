import { NextBestAction } from '../types';

export function getPrivacySummaryBadge(action: NextBestAction): {
  dataUsedText: string;
  dataNotUsedText: string;
} {
  return {
    dataUsedText: `Data used: ${action.dataUsed.join(', ')} (consent given).`,
    dataNotUsedText: `Data NOT used: ${action.dataNotUsed.join(', ')}.`,
  };
}

export function formatContributionTooltip(name: string, weight: number, explanation: string): string {
  return `${name}: ${weight}% influence on model confidence. ${explanation}`;
}
