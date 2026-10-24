import {
  Customer,
  CustomerConsent,
  CustomerCategory,
  TaskItem,
  MessageTemplate,
  ConsentLogEvent,
  AuditLogEvent,
  ReviewItem,
  NextBestAction,
  SentOfferRecord,
  NovaSettings,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('nova_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const novaApi = {
  // Health
  checkHealth: () => fetchJson<{ status: string; system: string; version: string }>('/health'),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchJson<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  demoLogin: (role: 'owner' | 'manager' | 'staff' | 'auditor') =>
    fetchJson<{ success: boolean; token: string; user: any }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  register: (payload: { email: string; password: string; name: string; shopName?: string }) =>
    fetchJson<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    fetchJson<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetOtp: (payload: { email: string; otp: string }) =>
    fetchJson<{ success: boolean; message: string; resetToken: string }>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendResetOtp: (email: string) =>
    fetchJson<{ success: boolean; message: string }>('/auth/resend-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetToken: (token: string) =>
    fetchJson<{ success: boolean; valid: boolean; message: string }>(
      `/auth/verify-reset-token?token=${encodeURIComponent(token)}`
    ),

  resetPassword: (payload: { token?: string; resetToken?: string; newPassword: string; confirmPassword?: string }) =>
    fetchJson<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    fetchJson<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => fetchJson<{ success: boolean; user: any }>('/auth/me'),

  // QR Check-in (Public)
  checkIn: (payload: {
    contact: string;
    name?: string;
    review?: string;
    rating?: number;
    consentGranted: boolean;
  }) =>
    fetchJson<{
      success: boolean;
      isNew: boolean;
      customer: Customer;
      visit: any;
      review?: ReviewItem;
    }>('/checkin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Customers
  getCustomers: (params?: { category?: string; search?: string; needsAttention?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.needsAttention) query.append('needsAttention', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ success: boolean; count: number; data: Customer[] }>(`/customers${queryString}`);
  },

  getCustomerById: (id: string) =>
    fetchJson<{
      success: boolean;
      data: {
        customer: Customer;
        visits: any[];
        reviews: ReviewItem[];
        sentOffers: SentOfferRecord[];
      };
    }>(`/customers/${id}`),

  updateCustomerConsent: (id: string, consent: Partial<CustomerConsent>) =>
    fetchJson<{ success: boolean; customer: Customer }>(`/customers/${id}/consent`, {
      method: 'PATCH',
      headers: { 'x-privacy-portal': 'customer-self-service' },
      body: JSON.stringify(consent),
    }),

  deleteCustomer: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/customers/${id}`, {
      method: 'DELETE',
      headers: { 'x-privacy-portal': 'customer-self-service' },
    }),

  exportCustomerData: async (id: string) => {
    const token = localStorage.getItem('nova_auth_token');
    const headers: Record<string, string> = { 'x-privacy-portal': 'customer-self-service' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/customers/${id}/export`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) throw new Error('Failed to export data');
    return res.text();
  },

  // Offers
  sendOffer: (payload: {
    category: CustomerCategory;
    channel: 'whatsapp' | 'sms' | 'email';
    customMessage?: string;
  }) =>
    fetchJson<{
      success: boolean;
      sentCount: number;
      excludedCount: number;
      totalCategoryMatches: number;
    }>('/offers/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSentOffers: () =>
    fetchJson<{ success: boolean; count: number; data: SentOfferRecord[] }>('/offers'),

  // Tasks & Actions
  getTasks: () => fetchJson<{ success: boolean; count: number; data: TaskItem[] }>('/tasks'),

  toggleTask: (id: string) =>
    fetchJson<{ success: boolean; task: TaskItem }>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    }),

  getActions: () =>
    fetchJson<{ success: boolean; count: number; data: NextBestAction[] }>('/actions'),

  completeAction: (id: string) =>
    fetchJson<{ success: boolean; action: NextBestAction }>(`/actions/${id}/complete`, {
      method: 'POST',
    }),

  // Templates
  getTemplates: () =>
    fetchJson<{ success: boolean; count: number; data: MessageTemplate[] }>('/templates'),

  updateTemplate: (id: string, content: string) =>
    fetchJson<{ success: boolean; template: MessageTemplate }>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),

  // Reviews
  getReviews: () =>
    fetchJson<{ success: boolean; count: number; data: ReviewItem[] }>('/reviews'),

  addReview: (review: { customerId: string; customerName: string; rating: number; comment: string }) =>
    fetchJson<{ success: boolean; review: ReviewItem }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),

  // Logs
  getConsentLogs: () =>
    fetchJson<{ success: boolean; count: number; data: ConsentLogEvent[] }>('/logs/consent'),

  getAuditLogs: () =>
    fetchJson<{ success: boolean; count: number; data: AuditLogEvent[] }>('/logs/audit'),

  // Settings
  getSettings: () => fetchJson<{ success: boolean; data: NovaSettings }>('/settings'),

  updateSettings: (settings: Partial<NovaSettings>) =>
    fetchJson<{ success: boolean; data: NovaSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Seeder
  seedDatabase: () =>
    fetchJson<{ success: boolean; message: string }>('/seed', {
      method: 'POST',
    }),

  // Email Service
  checkEmailStatus: () =>
    fetchJson<{ success: boolean; configured: boolean; verified: boolean; message: string }>('/email/status'),

  sendTestEmail: (to: string) =>
    fetchJson<{ success: boolean; result: any }>('/email/test', {
      method: 'POST',
      body: JSON.stringify({ to }),
    }),

  // Stage 2 & Stage 4 Governance & Stress Testing
  getGovernanceFramework: () =>
    fetchJson<{ success: boolean; framework: any }>('/governance/framework'),

  getSyntheticBenchmark: () =>
    fetchJson<{ success: boolean; sampleCount: number; sampleRecords: any[]; kAnonymityDemo: any[] }>(
      '/governance/synthetic-benchmark'
    ),

  runStressTest: () =>
    fetchJson<{ success: boolean; testName: string; executedAt: string; scenarios: any[]; summary: string }>(
      '/governance/stress-test',
      { method: 'POST' }
    ),

  runFairnessAudit: () =>
    fetchJson<{ success: boolean; testName: string; executedAt: string; disparateImpactByRegion: any[]; vulnerabilityExploitationAudit: any[]; verdict: string }>(
      '/governance/fairness-audit',
      { method: 'POST' }
    ),

  runRetentionJob: () =>
    fetchJson<{ success: boolean; report: any }>('/governance/retention-run', { method: 'POST' }),
};
