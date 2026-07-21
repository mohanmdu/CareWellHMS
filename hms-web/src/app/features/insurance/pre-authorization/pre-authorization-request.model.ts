export type PreAuthorizationStatus = 'YET_TO_BE_RAISED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PreAuthorizationRequest {
  id: number | null;
  requestNumber: string | null;
  patientId: number;
  patientName: string | null;
  patientUhid: string | null;
  admissionId: number | null;
  admissionNumber: string | null;
  policyNumber: string | null;
  insurerName: string | null;
  tpaName: string | null;
  corporateName: string | null;
  requestedAmount: number;
  approvedAmount: number | null;
  status: PreAuthorizationStatus;
  decisionReason: string | null;
  raisedAt: string | null;
  raisedBy: string | null;
}
