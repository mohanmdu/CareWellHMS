export interface Consultant {
  id: number | null;
  name: string;
  departmentId: number;
  departmentName: string | null;
  specialization: string | null;
  email: string | null;
  mobileNumber: string | null;
  consultationFee: number;
  active: boolean;
}
