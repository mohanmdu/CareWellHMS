export type RefundSource = 'APPOINTMENT' | 'DIRECT_BILLING';

/**
 * Result of searching a billed invoice by Invoice No. When alreadyRefunded
 * is true, refundNumber/refundAmount/refundedAt carry the existing refund -
 * a refund can only happen once per invoice. sourceId/source identify which
 * billing entity matched (Appointment or OP Direct Billing share one
 * invoice-number sequence, so at most one ever matches).
 */
export interface RefundCandidate {
  sourceId: number;
  source: RefundSource;
  patientName: string | null;
  patientRegistrationNumber: string | null;
  consultantName: string | null;
  invoiceNumber: number;
  invoicedAmount: number | null;
  paidAmount: number | null;
  billedBy: string | null;
  billedAt: string | null;
  alreadyRefunded: boolean;
  refundNumber: number | null;
  refundAmount: number | null;
  refundedAt: string | null;
}

export interface RefundRequest {
  sourceId: number;
  source: RefundSource;
  refundAmount: number;
  reason: string | null;
}

/**
 * One shape reused for both the receipt shown immediately after confirming
 * a refund and every row of the Refund Report - a report row already has
 * every field the receipt needs, so clicking into it needs no extra API call.
 */
export interface RefundReceiptEntry {
  sourceId: number;
  source: RefundSource;
  refundNumber: number;
  patientName: string | null;
  patientRegistrationNumber: string | null;
  consultantName: string | null;
  type: string;
  invoiceNumber: number;
  invoicedAmount: number | null;
  paidAmount: number | null;
  refundAmount: number;
  reason: string | null;
  billedAt: string | null;
  refundedAt: string;
  refundedBy: string | null;
}

export interface RefundReportFilter {
  fromDate?: string;
  toDate?: string;
  consultantId?: number;
}
