export interface PharmacySaleItem {
  id: number | null;
  batchId: number;
  drugName: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface PharmacySale {
  id: number | null;
  saleNumber: string | null;
  patientId: number;
  patientName: string | null;
  totalAmount: number | null;
  items: PharmacySaleItem[];
}
