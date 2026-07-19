export type PaymentRequestType = 'ADVANCE' | 'FINAL_SETTLEMENT' | 'DUE_AMOUNT';
export type PaymentRequestStatus = 'PENDING' | 'APPROVED';

export const PAYMENT_REQUEST_TYPE_OPTIONS: { value: PaymentRequestType; label: string }[] = [
  { value: 'ADVANCE', label: 'Advance' },
  { value: 'FINAL_SETTLEMENT', label: 'Final Settlement' },
  { value: 'DUE_AMOUNT', label: 'Due Amount' }
];

export const PAYMENT_MODE_OPTIONS = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'Demand Draft',
  'Cheque',
  'Google Pay',
  'Phone Pe',
  'Paytm'
];

export interface PaymentRequest {
  id: number;
  admissionId: number;
  admissionNumber: string | null;
  patientUhid: string | null;
  patientName: string | null;
  patientGender: string | null;
  patientAge: number | null;
  heightCm: number | null;
  weightKg: number | null;
  patientAddress: string | null;
  primaryConsultant: string | null;
  requestType: PaymentRequestType;
  amount: number;
  description: string | null;
  status: PaymentRequestStatus;
  paymentMode: string | null;
  requestedAt: string | null;
  requestedBy: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  ipPaymentId: number | null;
  receiptNumber: string | null;
}

export function requestTypeLabel(type: PaymentRequestType): string {
  return PAYMENT_REQUEST_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
