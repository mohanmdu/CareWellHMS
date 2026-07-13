export interface Manufacturer {
  id: number | null;
  name: string;
  contactPersonName: string | null;
  phoneNumber: string | null;
  address: string;
  city: string;
  state: string;
  active: boolean;
}
