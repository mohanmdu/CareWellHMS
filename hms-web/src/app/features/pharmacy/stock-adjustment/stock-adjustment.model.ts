export type PharmacyStockTransactionType = 'INTERNAL_RECEIPT' | 'STOCK_ADJUSTMENT';

export const PHARMACY_STOCK_TRANSACTION_TYPES: PharmacyStockTransactionType[] = ['INTERNAL_RECEIPT', 'STOCK_ADJUSTMENT'];
export const PHARMACY_STOCK_TRANSACTION_TYPE_LABELS: Record<PharmacyStockTransactionType, string> = {
  INTERNAL_RECEIPT: 'Internal Receipt',
  STOCK_ADJUSTMENT: 'Stock Adjustment'
};

export interface PharmacyStockTransactionRequest {
  stockId: number;
  transactionType: PharmacyStockTransactionType;
  quantity: number;
  locationId: number;
  reason: string | null;
}

export interface PharmacyStockTransaction {
  id: number;
  stockId: number;
  productName: string;
  batch: string | null;
  transactionType: PharmacyStockTransactionType;
  quantity: number;
  locationId: number;
  locationName: string;
  reason: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

/** A line already added to the Drug List working table, before Confirm. */
export interface StockAdjustmentWorkingItem {
  stockId: number;
  productName: string;
  productTypeName: string | null;
  batch: string | null;
  quantity: number;
}
