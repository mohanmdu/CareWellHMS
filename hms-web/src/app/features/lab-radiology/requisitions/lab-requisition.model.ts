export type RequisitionStatus = 'ORDERED' | 'CANCELLED';
export type RequisitionItemStatus = 'PENDING' | 'SPECIMEN_COLLECTED' | 'RESULT_ENTERED' | 'APPROVED';

export interface LabRequisitionItem {
  id: number | null;
  billingItemId: number;
  testName: string | null;
  specimenType: string | null;
  status: RequisitionItemStatus;
  resultValue: string | null;
  normalRange: string | null;
}

export interface LabRequisition {
  id: number | null;
  requisitionNumber: string | null;
  patientId: number;
  patientName: string | null;
  appointmentId: number | null;
  status: RequisitionStatus;
  notes: string | null;
  items: LabRequisitionItem[];
}
