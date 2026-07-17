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

export interface InventoryReportEntry {
  productId: number;
  productName: string;
  batch: string | null;
  packing: number;
  noPack: number;
  quantity: number;
  sellingPrice: number;
  netAmountSp: number;
  purchasePrice: number;
  netAmountPp: number;
  expiryDate: string | null;
}

export interface ExpiredReportEntry {
  productName: string;
  manufacturerName: string | null;
  supplierName: string;
  batch: string | null;
  quantity: number;
  purchasePrice: number;
  mrp: number;
  totalAmountSp: number;
  totalAmountPp: number;
  expiryDate: string;
}

export interface ItemWiseSalesDetail {
  saleId: number;
  invoiceNo: number;
  batch: string | null;
  vatPercent: number;
  registrationNumber: string | null;
  patientName: string;
  saleQty: number;
  sellingDate: string;
}

export interface ItemWiseSalesSummary {
  productName: string;
  batch: string | null;
  mrp: number | null;
  saleQty: number;
  netAmount: number;
  details: ItemWiseSalesDetail[];
}

export type ItemWiseReportType = 'SUPPLIER' | 'COMPANY' | 'PRODUCT';

export interface ItemWiseDetailEntry {
  grnId: number;
  invoiceNo: string;
  drugName: string;
  drugType: string | null;
  batch: string | null;
  qty: number;
  productPrice: number | null;
  mrp: number | null;
  netAmountInclGst: number;
  supplierName: string;
  manufacturerName: string | null;
}

export interface PatientBillEntry {
  saleId: number;
  billNumber: number;
  registrationNumber: string | null;
  patientName: string;
  type: string;
  invoiceDate: string;
  invoicedAmount: number;
  paidDate: string | null;
  dueAmount: number;
}

export interface PatientStatementItem {
  type: string | null;
  drugName: string;
  batch: string | null;
  expiryDate: string | null;
  qty: number;
  mrp: number | null;
  netAmount: number;
}

export interface PatientStatement {
  registrationNumber: string | null;
  patientName: string;
  gender: string | null;
  medicalItems: PatientStatementItem[];
  nonMedicalItems: PatientStatementItem[];
  paidAmount: number;
  discountAmount: number;
  dueAmount: number;
}

export interface ProductMovementEntry {
  productId: number;
  productName: string;
  purchaseQty: number;
  salesQty: number;
  returnQty: number;
  netQty: number;
}
