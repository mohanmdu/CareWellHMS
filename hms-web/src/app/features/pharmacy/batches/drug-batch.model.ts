export interface DrugBatch {
  id: number | null;
  drugId: number;
  drugName: string | null;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  purchasePrice: number;
  sellingPrice: number;
}
