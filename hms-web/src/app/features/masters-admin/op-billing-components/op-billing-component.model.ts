export interface OpBillingComponent {
  id: number | null;
  categoryId: number;
  categoryName: string | null;
  name: string;
  amount: number;
  active: boolean;
}
