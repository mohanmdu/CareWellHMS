export interface Supplier {
  id: number | null;
  name: string;
  contactPersonName: string | null;
  mobileNumber: string;
  address: string;
  city: string | null;
  landlineNumber: string | null;
  active: boolean;
}
