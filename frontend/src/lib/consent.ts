import { Customer, ConsentStatusType } from '../types';

export function getCustomerConsentStatus(customer: Customer): ConsentStatusType {
  const { consent } = customer;
  if (!consent.personalisedOffers) {
    return 'None';
  }
  
  const hasHistory = consent.purchaseHistory;
  const hasFrequency = consent.visitFrequency;
  const hasAnyChannel = consent.channels.whatsapp || consent.channels.sms || consent.channels.email;

  if (hasHistory && hasFrequency && hasAnyChannel) {
    return 'Full';
  }

  if (hasHistory || hasFrequency || hasAnyChannel) {
    return 'Partial';
  }

  return 'None';
}

export function canUseField(customer: Customer, field: 'purchaseHistory' | 'visitFrequency' | 'location'): boolean {
  if (!customer.consent.personalisedOffers) {
    return false;
  }
  return !!customer.consent[field];
}

export function canContactVia(customer: Customer, channel: 'whatsapp' | 'sms' | 'email'): boolean {
  if (!customer.consent.personalisedOffers) {
    return false;
  }
  return !!customer.consent.channels[channel];
}
