export interface BillingItem {
  id: number | null;
  name: string;
  categoryId: number;
  categoryName: string | null;
  price: number;
  active: boolean;
}
