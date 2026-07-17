export interface IpBillingComponent {
  id: number | null;
  categoryId: number;
  categoryName: string | null;
  name: string;
  ipAmount: number;
  insuranceAmount: number;
  active: boolean;
}
