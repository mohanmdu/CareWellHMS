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
}
