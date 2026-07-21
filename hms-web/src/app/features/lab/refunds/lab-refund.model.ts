/**
 * Result of searching a billed LabRequisition by Invoice No. When
 * alreadyRefunded is true, refundNumber/refundAmount/refundedAt carry the
 * existing refund - a refund can only happen once per invoice.
 */
export interface LabRefundCandidate {
  requisitionId: number;
  patientName: string;
  patientUhid: string;
  invoiceNumber: number;
  invoiceAmount: number;
  paidAmount: number | null;
  createdBy: string | null;
  alreadyRefunded: boolean;
  refundNumber: number | null;
  refundAmount: number | null;
  refundedAt: string | null;
}

export interface LabRefundRequest {
  requisitionId: number;
  refundAmount: number;
  reason: string | null;
}

/**
 * One shape reused for both the receipt shown immediately after confirming
 * a refund and every row of the Refund Report.
 */
export interface LabRefundReceiptEntry {
  id: number;
  requisitionId: number;
  refundNumber: number;
  patientName: string;
  patientUhid: string;
  gender: string | null;
  age: number | null;
  patientType: string | null;
  requisitionType: string;
  invoiceNumber: number;
  invoiceAmount: number;
  paidAmount: number | null;
  refundAmount: number;
  reason: string | null;
  billedAt: string | null;
  refundedAt: string;
  refundedBy: string | null;
}
