import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Customer,
  CustomerConsent,
  TaskItem,
  MessageTemplate,
  ConsentLogEvent,
  AuditLogEvent,
  UserRole,
  CustomerCategory,
  CategoryThresholds,
  Visit,
  ReviewItem,
  NextBestAction,
  SentOfferRecord,
} from '../types';
import { initialCustomers, initialVisits, initialReviews, initialSentOffers } from '../data/mockCustomers';
import { initialActions } from '../data/actions';
import { initialTasks } from '../data/tasks';
import { initialTemplates } from '../data/templates';
import { initialConsentLogs } from '../data/consentLogs';
import { defaultCategoryThresholds, classify, evaluateOfferEligibility } from '../lib/segmentation';

export interface NovaSettings {
  shopId: string;
  shopName: string;
  dataMinimization: boolean;
  retentionPeriodMonths: number;
  defaultChannel: 'whatsapp' | 'sms' | 'email';
  privacyMode: boolean;
  demoMode: boolean;
  demoCustomerId: string;
}

interface CheckInPayload {
  contact: string; // phone or email
  name?: string;
  review?: string;
  rating?: number;
  consentGranted: boolean;
}

interface NovaStoreState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;

  businessName: string;
  ownerName: string;
  customers: Customer[];
  visits: Visit[];
  reviews: ReviewItem[];
  sentOffers: SentOfferRecord[];
  tasks: TaskItem[];
  templates: MessageTemplate[];
  actions: NextBestAction[];
  consentLogs: ConsentLogEvent[];
  auditLogs: AuditLogEvent[];
  settings: NovaSettings;
  categoryThresholds: CategoryThresholds;

  // Actions
  addCheckIn: (payload: CheckInPayload) => { customer: Customer; isNew: boolean };
  sendCategoryOffer: (
    category: CustomerCategory,
    channel: 'whatsapp' | 'sms' | 'email',
    customMessage?: string
  ) => { sentCount: number; excludedCount: number };
  updateCustomerConsent: (customerId: string, newConsent: Partial<CustomerConsent>) => void;
  deleteCustomerData: (customerId: string) => void;
  exportCustomerData: (customerId: string) => string;
  toggleTaskCompletion: (taskId: string) => void;
  markActionDone: (actionId: string) => void;
  updateTemplate: (templateId: string, content: string) => void;
  toggleDemoMode: () => void;
  flipDemoCustomerConsent: () => void;
  updateSettings: (newSettings: Partial<NovaSettings>) => void;
  updateCategoryThresholds: (thresholds: Partial<CategoryThresholds>) => void;
  addAuditLog: (action: string, details: string) => void;
  resetToDefaults: () => void;
}

const defaultSettings: NovaSettings = {
  shopId: 'chai-and-co',
  shopName: 'Chai & Co',
  dataMinimization: true,
  retentionPeriodMonths: 6,
  defaultChannel: 'whatsapp',
  privacyMode: true,
  demoMode: true,
  demoCustomerId: 'C-1002', // Diya Patel
};

const initialAuditLogs: AuditLogEvent[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-23T14:32:00Z',
    user: 'Amanda (Owner)',
    role: 'owner',
    action: 'Dispatched Loyalty category offer',
    details: 'Sent complimentary Maska Bun vouchers to 18 eligible Regulars via WhatsApp.',
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-22T16:15:00Z',
    user: 'Karan (Manager)',
    role: 'manager',
    action: 'Simulated customer check-in',
    details: 'Customer C-1012 checked in at counter. Visit count incremented to 2.',
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-21T11:00:00Z',
    user: 'Amanda (Owner)',
    role: 'owner',
    action: 'Updated category thresholds',
    details: 'Configured new customer visit threshold to <= 2 visits.',
  },
  {
    id: 'aud-4',
    timestamp: '2026-10-20T09:40:00Z',
    user: 'Priya (Staff)',
    role: 'staff',
    action: 'Completed task queue item',
    details: 'Triggered 2nd-visit stamp double booster to new guests.',
  },
];

export const useNovaStore = create<NovaStoreState>()(
  persist(
    (set, get) => ({
      currentRole: 'owner',
      setRole: (role) => {
        get().addAuditLog(
          'Role switched',
          `Active session role changed to ${role.toUpperCase()}.`
        );
        set({ currentRole: role });
      },

      businessName: 'Chai & Co',
      ownerName: 'Amanda',
      customers: initialCustomers,
      visits: initialVisits,
      reviews: initialReviews,
      sentOffers: initialSentOffers,
      tasks: initialTasks,
      templates: initialTemplates,
      actions: initialActions,
      consentLogs: initialConsentLogs,
      auditLogs: initialAuditLogs,
      settings: defaultSettings,
      categoryThresholds: defaultCategoryThresholds,

      addAuditLog: (action, details) => {
        const entry: AuditLogEvent = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          user: `${get().ownerName} (${get().currentRole})`,
          role: get().currentRole,
          action,
          details,
        };
        set({ auditLogs: [entry, ...get().auditLogs] });
      },

      addCheckIn: ({ contact, name, review, rating, consentGranted }) => {
        const raw = contact.trim();
        const isEmail = raw.includes('@');
        const normalizedEmail = isEmail ? raw.toLowerCase() : '';
        const normalizedPhone = !isEmail ? raw.replace(/\D/g, '') : '';
        const timestamp = new Date().toISOString();
        const dateStr = timestamp.split('T')[0];

        const currentCustomers = get().customers;
        const thresholds = get().categoryThresholds;

        // Lookup existing customer by phone OR email
        const existingIndex = currentCustomers.findIndex((c) => {
          if (isEmail && c.email && c.email.toLowerCase() === normalizedEmail) return true;
          if (!isEmail && c.phone && c.phone.replace(/\D/g, '') === normalizedPhone) return true;
          return false;
        });

        let targetCustomer: Customer;
        let isNew = false;
        let updatedCustomers = [...currentCustomers];

        if (existingIndex >= 0) {
          // Existing customer found
          const existing = currentCustomers[existingIndex];
          const newVisitCount = existing.visitCount + 1;
          const newVisitsPerMonth = existing.visitsPerMonth + 1;

          const updatedConsent: CustomerConsent = {
            ...existing.consent,
            personalisedOffers: consentGranted ? true : existing.consent.personalisedOffers,
            updatedAt: timestamp,
          };

          const candidate: Customer = {
            ...existing,
            name: name && name.trim() ? name.trim() : existing.name,
            visitCount: newVisitCount,
            visitsPerMonth: newVisitsPerMonth,
            lastVisit: dateStr,
            lastVisitDaysAgo: 0,
            consent: updatedConsent,
          };

          const classification = classify(candidate, thresholds);
          targetCustomer = {
            ...candidate,
            category: classification.category,
            needsAttention: classification.needsAttention,
          };

          updatedCustomers[existingIndex] = targetCustomer;
        } else {
          // New customer check-in
          isNew = true;
          const nextNum = 1000 + currentCustomers.length + 1;
          const newId = `C-${nextNum}`;

          const newCustomerDraft: Customer = {
            id: newId,
            name: name && name.trim() ? name.trim() : (isEmail ? raw.split('@')[0] : `Guest ${newId}`),
            phone: normalizedPhone,
            email: normalizedEmail,
            firstVisit: dateStr,
            lastVisit: dateStr,
            lastVisitDaysAgo: 0,
            visitCount: 1,
            visitsPerMonth: 1,
            avgSpend: 250,
            favouriteCategory: 'Masala Chai',
            preferredChannel: isEmail ? 'email' : 'whatsapp',
            consent: {
              purchaseHistory: consentGranted,
              visitFrequency: consentGranted,
              emailOffers: consentGranted && isEmail,
              smsOffers: consentGranted && !isEmail,
              location: false,
              personalisedOffers: consentGranted,
              channels: {
                whatsapp: !isEmail,
                sms: !isEmail,
                email: isEmail,
              },
              updatedAt: timestamp,
            },
            category: 'NEW',
            needsAttention: false,
          };

          const classification = classify(newCustomerDraft, thresholds);
          targetCustomer = {
            ...newCustomerDraft,
            category: classification.category,
            needsAttention: classification.needsAttention,
          };

          updatedCustomers = [targetCustomer, ...currentCustomers];

          // Consent log for newly granted customer
          if (consentGranted) {
            const consentLog: ConsentLogEvent = {
              id: `log-${Date.now()}`,
              customerId: newId,
              eventType: 'Granted',
              timestamp,
              purposes: ['Visit frequency', 'Personalised offers'],
              channels: [isEmail ? 'Email' : 'WhatsApp/SMS'],
              details: `Initial consent given during customer QR check-in at ${get().settings.shopName}.`,
            };
            set({ consentLogs: [consentLog, ...get().consentLogs] });
          }
        }

        // Add visit record
        const newVisit: Visit = {
          id: `v-${Date.now()}`,
          customerId: targetCustomer.id,
          date: timestamp,
          spend: targetCustomer.avgSpend,
          review: review && review.trim() ? review.trim() : undefined,
          rating: rating && rating > 0 ? rating : undefined,
        };

        const newVisits = [newVisit, ...get().visits];

        // Add review if provided
        let newReviews = get().reviews;
        if (review && review.trim()) {
          const revItem: ReviewItem = {
            id: `rev-${Date.now()}`,
            customerId: targetCustomer.id,
            customerName: targetCustomer.name,
            rating: rating || 5,
            comment: review.trim(),
            date: dateStr,
          };
          newReviews = [revItem, ...newReviews];
        }

        // Audit log
        get().addAuditLog(
          isNew ? 'New patron QR registration' : 'Customer check-in recorded',
          `Patron ${targetCustomer.id} (${targetCustomer.name}) checked in. Total visits: ${targetCustomer.visitCount}. Category: ${targetCustomer.category}.`
        );

        set({
          customers: updatedCustomers,
          visits: newVisits,
          reviews: newReviews,
        });

        return { customer: targetCustomer, isNew };
      },

      sendCategoryOffer: (category, channel, customMessage) => {
        const customers = get().customers;
        const thresholds = get().categoryThresholds;
        const timestamp = new Date().toISOString();

        let sentCount = 0;
        let excludedCount = 0;
        const newOfferRecords: SentOfferRecord[] = [];

        customers.forEach((c) => {
          const result = evaluateOfferEligibility(c, category, channel, thresholds);
          if (result.eligible) {
            sentCount++;
            newOfferRecords.push({
              id: `sent-${Date.now()}-${c.id}`,
              customerId: c.id,
              type: category === 'NEW' ? 'welcome' : category === 'REGULAR' ? 'loyalty' : 'winback',
              category,
              channel,
              sentAt: timestamp,
              status: 'Sent',
              title: `${category} Automated Reward Offer`,
              discount: category === 'NEW' ? 'WELCOME10' : category === 'REGULAR' ? 'FREE-ITEM' : 'COMEBACK20',
            });
          } else {
            // Count patrons of that category who were excluded
            if (classify(c, thresholds).category === category) {
              excludedCount++;
            }
          }
        });

        get().addAuditLog(
          `Dispatched ${category} Category Offer`,
          `Simulated transmission to ${sentCount} consented patrons via ${channel.toUpperCase()}. ${excludedCount} excluded due to privacy or missing contact.`
        );

        set({
          sentOffers: [...newOfferRecords, ...get().sentOffers],
        });

        return { sentCount, excludedCount };
      },

      updateCustomerConsent: (customerId, partialConsent) => {
        const timestamp = new Date().toISOString();
        const currentCustomers = get().customers;
        const targetIndex = currentCustomers.findIndex((c) => c.id === customerId);
        if (targetIndex === -1) return;

        const currentCustomer = currentCustomers[targetIndex];
        const updatedConsent: CustomerConsent = {
          ...currentCustomer.consent,
          ...partialConsent,
          channels: {
            ...currentCustomer.consent.channels,
            ...(partialConsent.channels || {}),
          },
          updatedAt: timestamp,
        };

        const updatedCustomer: Customer = {
          ...currentCustomer,
          consent: updatedConsent,
        };

        const updatedCustomers = [...currentCustomers];
        updatedCustomers[targetIndex] = updatedCustomer;

        let eventType: ConsentLogEvent['eventType'] = 'Updated';
        if (partialConsent.personalisedOffers === false) {
          eventType = 'Withdrawn';
        } else if (partialConsent.personalisedOffers === true && !currentCustomer.consent.personalisedOffers) {
          eventType = 'Granted';
        }

        const purposes: string[] = [];
        if (updatedConsent.personalisedOffers) {
          purposes.push('Personalised offers');
          if (updatedConsent.purchaseHistory) purposes.push('Purchase history');
          if (updatedConsent.visitFrequency) purposes.push('Visit frequency');
          if (updatedConsent.emailOffers) purposes.push('Email offers');
          if (updatedConsent.smsOffers) purposes.push('SMS offers');
        }

        const channels: string[] = [];
        if (updatedConsent.channels.whatsapp) channels.push('WhatsApp');
        if (updatedConsent.channels.sms) channels.push('SMS');
        if (updatedConsent.channels.email) channels.push('Email');

        const newLog: ConsentLogEvent = {
          id: `log-${Date.now()}`,
          customerId,
          eventType,
          timestamp,
          purposes,
          channels,
          details:
            eventType === 'Withdrawn'
              ? 'Customer withdrew master consent for personalised actions. Excluded from all category offer queues.'
              : `Preferences updated: ${purposes.join(', ') || 'No active purposes'}. Channels: ${channels.join(', ') || 'None'}.`,
        };

        get().addAuditLog(
          `Consent ${eventType} for ${customerId}`,
          `Customer ${customerId} updated privacy settings. Personalised offers: ${updatedConsent.personalisedOffers ? 'ON' : 'OFF'}.`
        );

        set({
          customers: updatedCustomers,
          consentLogs: [newLog, ...get().consentLogs],
        });
      },

      deleteCustomerData: (customerId) => {
        const timestamp = new Date().toISOString();
        const newLog: ConsentLogEvent = {
          id: `log-${Date.now()}`,
          customerId,
          eventType: 'Data Deleted',
          timestamp,
          purposes: [],
          channels: [],
          details: `Right to be forgotten exercised. All profile, purchase, and visit data purged permanently for ${customerId}.`,
        };

        get().addAuditLog(
          `Customer data erased: ${customerId}`,
          `Exercised right to be forgotten. Removed customer records, reviews, and visit history.`
        );

        set({
          customers: get().customers.filter((c) => c.id !== customerId),
          visits: get().visits.filter((v) => v.customerId !== customerId),
          reviews: get().reviews.filter((r) => r.customerId !== customerId),
          consentLogs: [newLog, ...get().consentLogs],
        });
      },

      exportCustomerData: (customerId) => {
        const customer = get().customers.find((c) => c.id === customerId);
        const timestamp = new Date().toISOString();
        if (!customer) return '{}';

        const exportPayload = {
          exportedAt: timestamp,
          system: 'Nova Insights Privacy Portal',
          shop: get().settings.shopName,
          customerId: customer.id,
          profile: {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            firstVisit: customer.firstVisit,
            lastVisit: customer.lastVisit,
          },
          trackingMetrics: {
            totalVisits: customer.visitCount,
            monthlyVisits: customer.consent.visitFrequency ? customer.visitsPerMonth : 'REDACTED_NO_CONSENT',
            lastVisitDaysAgo: customer.consent.visitFrequency ? customer.lastVisitDaysAgo : 'REDACTED_NO_CONSENT',
            category: customer.category,
            favouriteCategory: customer.consent.purchaseHistory ? customer.favouriteCategory : 'REDACTED_NO_CONSENT',
          },
          consentStatus: customer.consent,
          auditNotice: 'This open JSON bundle complies with DPDP and GDPR data portability requirements.',
        };

        const newLog: ConsentLogEvent = {
          id: `log-${Date.now()}`,
          customerId,
          eventType: 'Data Exported',
          timestamp,
          purposes: [],
          channels: [],
          details: `Customer downloaded complete data portability bundle in JSON format.`,
        };

        get().addAuditLog(
          `Data exported for ${customerId}`,
          `JSON bundle generated via customer privacy portal.`
        );

        set({
          consentLogs: [newLog, ...get().consentLogs],
        });

        return JSON.stringify(exportPayload, null, 2);
      },

      toggleTaskCompletion: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set({
          tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        });
        if (task) {
          get().addAuditLog(
            `Task status changed: ${task.title}`,
            `Task toggled to ${!task.completed ? 'COMPLETED' : 'PENDING'}.`
          );
        }
      },

      markActionDone: (actionId: string) => {
        set({
          actions: get().actions.map((a) => (a.id === actionId ? { ...a, isCompleted: true } : a)),
          tasks: get().tasks.map((t) => (t.actionId === actionId ? { ...t, completed: true } : t)),
        });
        const targetAction = get().actions.find((a) => a.id === actionId);
        if (targetAction) {
          get().addAuditLog(
            `Action completed: ${targetAction.title}`,
            `Action marked as completed by ${get().currentRole}.`
          );
        }
      },

      updateTemplate: (templateId, content) => {
        set({
          templates: get().templates.map((tmpl) =>
            tmpl.id === templateId ? { ...tmpl, content } : tmpl
          ),
        });
        get().addAuditLog(
          `Message template updated: ${templateId}`,
          `Template content altered by ${get().currentRole}.`
        );
      },

      toggleDemoMode: () => {
        const current = get().settings.demoMode;
        set({
          settings: {
            ...get().settings,
            demoMode: !current,
          },
        });
      },

      flipDemoCustomerConsent: () => {
        const demoId = get().settings.demoCustomerId;
        const customer = get().customers.find((c) => c.id === demoId);
        if (!customer) return;

        const currentConsent = customer.consent.personalisedOffers;
        get().updateCustomerConsent(demoId, {
          personalisedOffers: !currentConsent,
          purchaseHistory: !currentConsent,
          visitFrequency: !currentConsent,
        });
      },

      updateSettings: (newSettings) => {
        set({
          settings: {
            ...get().settings,
            ...newSettings,
          },
        });
        get().addAuditLog('Store settings updated', 'Updated shop privacy and communication settings.');
      },

      updateCategoryThresholds: (newThresholds) => {
        const updated = {
          ...get().categoryThresholds,
          ...newThresholds,
        };

        // Re-classify all customers with new thresholds
        const reclassifiedCustomers = get().customers.map((c) => {
          const res = classify(c, updated);
          return {
            ...c,
            category: res.category,
            needsAttention: res.needsAttention,
          };
        });

        get().addAuditLog(
          'Classification thresholds updated',
          `New thresholds applied across ${reclassifiedCustomers.length} customer records.`
        );

        set({
          categoryThresholds: updated,
          customers: reclassifiedCustomers,
        });
      },

      resetToDefaults: () => {
        set({
          currentRole: 'owner',
          businessName: 'Chai & Co',
          ownerName: 'Amanda',
          customers: initialCustomers,
          visits: initialVisits,
          reviews: initialReviews,
          sentOffers: initialSentOffers,
          tasks: initialTasks,
          templates: initialTemplates,
          actions: initialActions,
          consentLogs: initialConsentLogs,
          auditLogs: initialAuditLogs,
          settings: defaultSettings,
          categoryThresholds: defaultCategoryThresholds,
        });
      },
    }),
    {
      name: 'nova_insights_store_v2',
      partialize: (state) => ({
        currentRole: state.currentRole,
        businessName: state.businessName,
        customers: state.customers,
        visits: state.visits,
        reviews: state.reviews,
        sentOffers: state.sentOffers,
        tasks: state.tasks,
        templates: state.templates,
        actions: state.actions,
        consentLogs: state.consentLogs,
        auditLogs: state.auditLogs,
        settings: state.settings,
        categoryThresholds: state.categoryThresholds,
      }),
    }
  )
);
