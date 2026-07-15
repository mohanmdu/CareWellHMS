export type PurchaseType = 'CREDIT' | 'CASH';
export type GrnStatus = 'DRAFT' | 'APPROVED';

export const PURCHASE_TYPES: PurchaseType[] = ['CREDIT', 'CASH'];
export const PURCHASE_TYPE_LABELS: Record<PurchaseType, string> = {
  CREDIT: 'Credit Purchase',
  CASH: 'Cash Purchase'
};

export interface GrnItem {
  id: number;
  productId: number;
  productName: string;
  productTypeName: string | null;
  packing: number;
  qty: number;
  totalQty: number;
  freeQty: number;
  batch: string | null;
  expiryDate: string | null;
  manufactureDate: string | null;
  mrp: number | null;
  purchaseRate: number;
  discountPercent: number | null;
  discountAmount: number | null;
  hsnSac: string | null;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  netValue: number;
}

export interface Grn {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierAddress: string;
  supplierMobileNumber: string;
  purchaseType: PurchaseType;
  invoiceNo: string;
  invoiceDate: string;
  invoiceAmount: number;
  poNumber: string | null;
  grnDate: string;
  grnAmount: number;
  discountAmount: number | null;
  creditNote: string | null;
  debitNote: string | null;
  returnAmount: number | null;
  status: GrnStatus;
  items: GrnItem[];
  createdBy: string | null;
}

export interface GrnListEntry {
  id: number;
  supplierName: string;
  invoiceNo: string;
  grnDate: string;
  grnAmount: number;
  status: GrnStatus;
}

export interface GrnItemRequest {
  productId: number;
  packing: number;
  qty: number;
  totalQty: number;
  freeQty: number | null;
  batch: string | null;
  expiryDate: string | null;
  manufactureDate: string | null;
  mrp: number | null;
  purchaseRate: number;
  discountPercent: number | null;
  discountAmount: number | null;
  hsnSac: string | null;
  sgstPercent: number | null;
  cgstPercent: number | null;
}

export interface GrnRequest {
  supplierId: number;
  purchaseType: PurchaseType;
  invoiceNo: string;
  invoiceDate: string;
  poNumber: string | null;
  grnDate: string;
  discountAmount: number | null;
  creditNote: string | null;
  debitNote: string | null;
  returnAmount: number | null;
  items: GrnItemRequest[];
  status: GrnStatus;
}

/** A line already added to the GRN working table, before Approve/Save as Draft. */
export interface GrnWorkingItem {
  productId: number;
  productName: string;
  productTypeName: string | null;
  packing: number;
  qty: number;
  totalQty: number;
  freeQty: number;
  batch: string | null;
  expiryDate: string | null;
  manufactureDate: string | null;
  mrp: number | null;
  purchaseRate: number;
  discountPercent: number | null;
  discountAmount: number | null;
  hsnSac: string | null;
  sgstPercent: number | null;
  sgstAmount: number;
  cgstPercent: number | null;
  cgstAmount: number;
  netValue: number;
}
