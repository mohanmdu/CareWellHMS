export type AdmissionStatus = 'ADMITTED' | 'DISCHARGED';

export interface Admission {
  id: number | null;
  admissionNumber: string | null;
  patientId: number;
  patientName: string | null;
  roomId: number;
  roomNumber: string | null;
  roomTypeName: string | null;
  admissionDate: string | null;
  status: AdmissionStatus;
  advanceAmount: number | null;
  totalBilled: number | null;
  settlementAmount: number | null;
  dischargeDate: string | null;
  dischargeSummary: string | null;
}
