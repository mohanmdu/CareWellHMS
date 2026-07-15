export type PharmacyRequestSource = 'OP' | 'IP';
export type PharmacyRequestStatus = 'PENDING' | 'BILLED' | 'CANCELLED';

export interface PharmacyRequestItem {
  id: number;
  productId: number | null;
  drugName: string;
  qty: number | null;
}

export interface PharmacyRequest {
  id: number;
  patientId: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  mobileNumber: string | null;
  source: PharmacyRequestSource;
  status: PharmacyRequestStatus;
  items: PharmacyRequestItem[];
  createdBy: string | null;
  createdAt: string;
}

export interface PharmacyRequestListEntry {
  id: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  source: PharmacyRequestSource;
  status: PharmacyRequestStatus;
  createdBy: string | null;
  createdAt: string;
}
