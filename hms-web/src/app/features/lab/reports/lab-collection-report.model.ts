export interface LabCollectionReportRow {
  requisitionId: number;
  patientName: string;
  patientUhid: string;
  typeLabel: string;
  billedAt: string | null;
  paymentMode: string | null;
  consultantName: string | null;
  billedBy: string | null;
  invoiceNumber: number | null;
  invoiceAmount: number;
  doctorReferralAmount: number;
  discountAmount: number;
  receiptAmount: number;
  refundAmount: number;
}

export interface LabCollectionReportTotals {
  invoiceAmount: number;
  doctorReferralAmount: number;
  discountAmount: number;
  receiptAmount: number;
  refundAmount: number;
  totalCollectionAmount: number;
}

export interface LabCollectionReport {
  rows: LabCollectionReportRow[];
  totals: LabCollectionReportTotals;
}

export interface LabCollectionReportDetailFilters {
  from?: string;
  to?: string;
  consultantId?: number;
  categoryId?: number;
  paymentMode?: string;
}

export interface LabCancelledReportRow {
  requisitionId: number;
  patientUhid: string;
  patientName: string;
  invoiceNumber: number | null;
  typeLabel: string;
  amount: number;
  requisitionDate: string;
}
