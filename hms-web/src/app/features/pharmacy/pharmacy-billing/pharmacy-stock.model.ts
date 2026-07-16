export interface PharmacyStock {
  id: number;
  productId: number;
  productName: string;
  productTypeName: string | null;
  batch: string | null;
  expiryDate: string | null;
  manufactureDate: string | null;
  mrp: number | null;
  purchaseRate: number | null;
  quantityOnHand: number;
  packing: number | null;
}

/** One row of the Stock Balance Report - the closing-stock formula per product. */
export interface StockBalanceEntry {
  productId: number;
  productName: string;
  openingStock: number;
  saleQty: number;
  returnQty: number;
  internReceiptQty: number;
  stockAdjustmentQty: number;
  closingStock: number;
}
