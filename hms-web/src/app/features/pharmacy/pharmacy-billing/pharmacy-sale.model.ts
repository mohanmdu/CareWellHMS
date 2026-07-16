export type PharmacySaleSource = 'OP' | 'IP' | 'OTHERS';
export type PharmacyBillingType = 'CASH' | 'CREDIT';
export type PharmacyPaymentMode = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD';

export const PHARMACY_BILLING_TYPES: PharmacyBillingType[] = ['CASH', 'CREDIT'];
export const PHARMACY_BILLING_TYPE_LABELS: Record<PharmacyBillingType, string> = {
  CASH: 'Cash',
  CREDIT: 'Credit'
};

export const PHARMACY_PAYMENT_MODES: PharmacyPaymentMode[] = ['CASH', 'DEBIT_CARD', 'CREDIT_CARD'];
export const PHARMACY_PAYMENT_MODE_LABELS: Record<PharmacyPaymentMode, string> = {
  CASH: 'Cash',
  DEBIT_CARD: 'Debit Card',
  CREDIT_CARD: 'Credit Card'
};

export interface PharmacySaleItem {
  id: number;
  stockId: number;
  productName: string;
  productTypeName: string | null;
  batch: string | null;
  expiryDate: string | null;
  mrp: number | null;
  quantity: number;
  amount: number;
  hsnSac: string | null;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  netAmount: number;
}

export interface PharmacySale {
  id: number;
  billNumber: number;
  patientId: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  gender: string | null;
  age: number | null;
  mobileNumber: string | null;
  address: string | null;
  locationId: number;
  locationName: string;
  source: PharmacySaleSource;
  billingType: PharmacyBillingType;
  paymentMode: PharmacyPaymentMode;
  consultantId: number | null;
  consultantName: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  discountReason: string | null;
  items: PharmacySaleItem[];
  totalAmount: number;
  amountPaid: number;
  balanceAmount: number;
  remarks: string | null;
  billedBy: string | null;
  billedAt: string;
}

export interface PharmacySaleListEntry {
  id: number;
  billNumber: number;
  registrationNumber: string | null;
  patientName: string | null;
  source: PharmacySaleSource;
  billingType: PharmacyBillingType;
  paymentMode: PharmacyPaymentMode;
  billedAt: string;
  billedBy: string | null;
  totalAmount: number;
  discountAmount: number | null;
  amountPaid: number;
  balanceAmount: number;
}

export interface PharmacySaleItemRequest {
  stockId: number;
  quantity: number;
}

export const PHARMACY_PAY_MODES = ['Cash', 'Debit Card', 'Credit Card', 'Demand Draft', 'Cheque'] as const;

export interface PharmacySalePaymentRequest {
  amount: number;
  discountAmount: number | null;
  remarks: string | null;
  payMode: string;
}

export interface PharmacySaleRequest {
  patientId: number;
  locationId: number;
  source: PharmacySaleSource;
  pharmacyRequestId: number | null;
  billingType: PharmacyBillingType;
  paymentMode: PharmacyPaymentMode;
  consultantId: number | null;
  discountPercent: number | null;
  discountAmount: number | null;
  discountReason: string | null;
  items: PharmacySaleItemRequest[];
  amountPaid: number;
  remarks: string | null;
}

/** A line already added to the billing working table, before Final Approve. */
export interface PharmacySaleWorkingItem {
  stockId: number;
  productName: string;
  productTypeName: string | null;
  batch: string | null;
  expiryDate: string | null;
  mrp: number | null;
  quantityAvailable: number;
  quantity: number;
  amount: number;
}
