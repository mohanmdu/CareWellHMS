export interface PharmacyStatementEntry {
  billNumber: number;
  registrationNumber: string | null;
  patientType: string;
  patientName: string;
  date: string;
  createdBy: string | null;
  amount: number;
}

export interface TaxStatementEntry {
  period: string;
  taxAmount: number;
}

export interface SalesGstEntry {
  saleId: number;
  invoiceNo: number;
  patientName: string;
  drugDetails: string;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  mrp: number | null;
  netAmount: number;
}

export interface SalesReturnGstEntry {
  returnId: number;
  invoiceNo: number;
  patientName: string;
  drugDetails: string;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  mrp: number | null;
  netAmount: number;
}

export interface PurchaseGstEntry {
  grnId: number;
  invoiceNo: string;
  drugDetails: string;
  purchaseAmount: number;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  netAmount: number;
}

export type DrugScheduleFilterType = 'SCHEDULE' | 'SCHEDULE_H' | 'SCHEDULE_H1';

export const DI_REPORT_TYPES: DrugScheduleFilterType[] = ['SCHEDULE_H1', 'SCHEDULE_H', 'SCHEDULE'];

export const DI_REPORT_TYPE_LABELS: Record<DrugScheduleFilterType, string> = {
  SCHEDULE_H1: 'Schedule-H1',
  SCHEDULE_H: 'Schedule-H',
  SCHEDULE: 'Schedule'
};

export interface DiReportEntry {
  saleId: number;
  billNumber: number;
  date: string;
  registrationNumber: string | null;
  patientName: string;
  drName: string | null;
  manufacturerName: string | null;
  productName: string;
  qtyIssued: number;
  mrp: number | null;
  batchNo: string | null;
  expiryDate: string | null;
  pharmacistSign: string | null;
}
