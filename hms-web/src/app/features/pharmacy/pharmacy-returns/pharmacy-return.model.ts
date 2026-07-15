export type PharmacyReturnType = 'CASH' | 'CASHLESS';
export type PharmacyReturnStatus = 'PENDING' | 'APPROVED';

export const PHARMACY_RETURN_TYPES: PharmacyReturnType[] = ['CASH', 'CASHLESS'];
export const PHARMACY_RETURN_TYPE_LABELS: Record<PharmacyReturnType, string> = {
  CASH: 'Cash Return',
  CASHLESS: 'Cashless Return'
};

export const PHARMACY_RETURN_STATUS_LABELS: Record<PharmacyReturnStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved'
};

export interface PharmacyReturnInvoiceItem {
  saleItemId: number;
  productName: string;
  productTypeName: string | null;
  batch: string | null;
  expiryDate: string | null;
  manufacturerName: string | null;
  quantitySold: number;
  remainingQty: number;
  mrp: number | null;
  sgstPercent: number | null;
  cgstPercent: number | null;
  netAmount: number;
}

export interface PharmacyReturnInvoice {
  saleId: number;
  billNumber: number;
  billedAt: string;
  patientId: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  consultantName: string | null;
  locationId: number;
  locationName: string;
  items: PharmacyReturnInvoiceItem[];
}

export interface PharmacyReturnItemRequest {
  saleItemId: number;
  quantity: number;
}

export interface PharmacyReturnRequest {
  saleId: number;
  returnType: PharmacyReturnType;
  remarks: string | null;
  items: PharmacyReturnItemRequest[];
}

export interface PharmacyReturnItem {
  id: number;
  saleItemId: number;
  productName: string;
  batch: string | null;
  mrp: number | null;
  quantity: number;
  amount: number;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  netAmount: number;
}

export interface PharmacyReturn {
  id: number;
  saleId: number;
  billNumber: number;
  patientId: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  locationId: number;
  locationName: string;
  returnType: PharmacyReturnType;
  status: PharmacyReturnStatus;
  items: PharmacyReturnItem[];
  totalAmount: number;
  remarks: string | null;
  submittedBy: string | null;
  submittedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface PharmacyReturnSummary {
  id: number;
  saleId: number;
  billNumber: number;
  patientId: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  locationId: number;
  locationName: string;
  returnType: PharmacyReturnType;
  status: PharmacyReturnStatus;
  totalAmount: number;
  remarks: string | null;
  submittedBy: string | null;
  submittedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

/** A line already picked into the return-entry working table, before Submit. */
export interface PharmacyReturnWorkingItem {
  saleItemId: number;
  productName: string;
  batch: string | null;
  mrp: number | null;
  quantity: number;
  netAmount: number;
}
