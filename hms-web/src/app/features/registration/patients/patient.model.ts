export interface Patient {
  id: number | null;
  registrationNumber: string | null;
  firstName: string;
  lastName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  age?: number | null;
  mobileNumber: string;
  email?: string | null;
  address?: string | null;
  active?: boolean;
}

export interface PatientAuditLogEntry {
  id: number;
  operation: string;
  patientName: string;
  performedBy: string;
  performedAt: string;
}
