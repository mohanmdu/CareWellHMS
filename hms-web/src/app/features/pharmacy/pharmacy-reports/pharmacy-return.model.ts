export interface PharmacyReturnListEntry {
  id: number;
  saleId: number;
  billNumber: number;
  productName: string;
  quantity: number;
  amount: number;
  remarks: string | null;
  returnedBy: string | null;
  returnedAt: string;
}
