/**
 * Which CEO/MD Dashboard revenue slice a billing category rolls up into -
 * tags IP Billing Category, OP Billing Category and Lab Category (all three
 * are free-text, admin-typed masters with no fixed taxonomy). Mirrors
 * com.pms.masters.entity.RevenueBucket on the backend.
 */
export type RevenueBucket = 'CONSULTING_FEE' | 'LAB' | 'RADIOLOGY' | 'PHARMACY' | 'OTHER';

export const REVENUE_BUCKET_OPTIONS: { value: RevenueBucket; label: string }[] = [
  { value: 'CONSULTING_FEE', label: 'Consulting Fee' },
  { value: 'LAB', label: 'Lab' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'OTHER', label: 'Other' }
];
