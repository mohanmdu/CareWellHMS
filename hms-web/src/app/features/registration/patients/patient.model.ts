export interface Patient {
  id: number | null;
  registrationNumber: string | null;
  firstName: string;
  lastName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  mobileNumber: string;
  email?: string | null;
  address?: string | null;
}
