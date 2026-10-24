import { UserRole, Customer } from '../types';

export type AppAction =
  | 'view_dashboard'
  | 'manage_qr'
  | 'view_customers'
  | 'view_customer_details'
  | 'view_offers'
  | 'send_offers'
  | 'view_reviews'
  | 'view_tasks'
  | 'edit_tasks'
  | 'view_templates'
  | 'edit_templates'
  | 'view_impact'
  | 'view_consent_log'
  | 'view_activity_audit'
  | 'edit_settings'
  | 'simulate_checkin'
  | 'delete_customer'
  | 'export_data';

const rolePermissions: Record<UserRole, AppAction[]> = {
  owner: [
    'view_dashboard',
    'manage_qr',
    'view_customers',
    'view_customer_details',
    'view_offers',
    'send_offers',
    'view_reviews',
    'view_tasks',
    'edit_tasks',
    'view_templates',
    'edit_templates',
    'view_impact',
    'view_consent_log',
    'view_activity_audit',
    'edit_settings',
    'simulate_checkin',
    'delete_customer',
    'export_data',
  ],
  manager: [
    'view_dashboard',
    'manage_qr',
    'view_customers',
    'view_customer_details',
    'view_offers',
    'send_offers',
    'view_reviews',
    'view_tasks',
    'edit_tasks',
    'view_templates',
    'edit_templates',
    'view_impact',
    'view_consent_log',
    'view_activity_audit',
    'simulate_checkin',
    'export_data',
  ],
  staff: [
    'view_tasks',
    'edit_tasks',
    'view_templates',
    'simulate_checkin',
  ],
  auditor: [
    'view_consent_log',
    'view_activity_audit',
  ],
  customer: [],
};

export function can(role: UserRole, action: AppAction): boolean {
  return rolePermissions[role]?.includes(action) ?? false;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '****';
  const prefix = digits.slice(-10, -8);
  const suffix = digits.slice(-4);
  return `${prefix}****${suffix}`;
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***';
  const name = parts[0];
  const domain = parts[1];
  const firstChar = name.length > 0 ? name[0] : 'u';
  return `${firstChar}***@${domain}`;
}

export function getDisplayContact(
  customer: Customer,
  field: 'phone' | 'email',
  role: UserRole
): string {
  // If customer has opted out, always hidden for everyone including owner
  if (!customer.consent.personalisedOffers) {
    return 'Hidden (no consent)';
  }

  const rawValue = customer[field];
  if (!rawValue) return 'Not provided';

  // Owner sees full contact (for consented patrons)
  if (role === 'owner') {
    return rawValue;
  }

  // Manager and staff see masked contacts
  if (field === 'phone') {
    return maskPhone(rawValue);
  }
  return maskEmail(rawValue);
}
