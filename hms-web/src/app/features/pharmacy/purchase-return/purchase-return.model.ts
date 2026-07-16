export type PharmacyPurchaseReturnType = 'NORMAL' | 'EXPIRED' | 'SLOW_MOVING' | 'FAST_MOVING' | 'NON_MOVING';

export const PHARMACY_PURCHASE_RETURN_TYPES: PharmacyPurchaseReturnType[] = [
  'NORMAL',
  'EXPIRED',
  'SLOW_MOVING',
  'FAST_MOVING',
  'NON_MOVING'
];
export const PHARMACY_PURCHASE_RETURN_TYPE_LABELS: Record<PharmacyPurchaseReturnType, string> = {
  NORMAL: 'Normal Return',
  EXPIRED: 'Expired Return',
  SLOW_MOVING: 'Slow Moving',
  FAST_MOVING: 'Fast Moving',
  NON_MOVING: 'Non-Moving'
};

export interface PharmacyPurchaseReturnEligibleItem {
  stockId: number;
  invoiceNo: string;
  productName: string;
  productTypeName: string | null;
  batch: string | null;
  purchaseQty: number;
  quantityOnHand: number;
  productPrice: number | null;
  mrp: number | null;
}

export interface PharmacyPurchaseReturnItemRequest {
  stockId: number;
  quantity: number;
}

export interface PharmacyPurchaseReturnRequest {
  supplierId: number;
  returnType: PharmacyPurchaseReturnType;
  remarks: string | null;
  items: PharmacyPurchaseReturnItemRequest[];
}

export interface PharmacyPurchaseReturnItem {
  id: number;
  stockId: number;
  productName: string;
  batch: string | null;
  mrp: number | null;
  purchaseRate: number | null;
  quantity: number;
  netAmount: number;
}

export interface PharmacyPurchaseReturn {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierAddress: string | null;
  supplierMobileNumber: string | null;
  returnType: PharmacyPurchaseReturnType;
  remarks: string | null;
  items: PharmacyPurchaseReturnItem[];
  totalAmount: number;
  returnedBy: string | null;
  createdAt: string;
}

export interface PharmacyPurchaseReturnSummary {
  id: number;
  returnType: PharmacyPurchaseReturnType;
  remarks: string | null;
  totalAmount: number;
  returnedBy: string | null;
  createdAt: string;
}

/** A line already picked into the Purchase Return Entry working table, before Confirm. */
export interface PurchaseReturnWorkingItem {
  stockId: number;
  productName: string;
  batch: string | null;
  productPrice: number | null;
  quantity: number;
  netAmount: number;
}
