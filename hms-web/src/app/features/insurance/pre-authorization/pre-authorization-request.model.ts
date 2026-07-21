export type PreAuthorizationStatus = 'YET_TO_BE_RAISED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PreAuthorizationRequest {
  id: number | null;
  requestNumber: string | null;
  patientId: number;
  patientName: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientAge: number | null;
  maritalStatus: string | null;
  admissionId: number | null;
  admissionNumber: string | null;
  admissionDate: string | null;
  paymentType: string | null;
  roomNumber: string | null;
  attenderName: string | null;
  relationType: string | null;
  relationMobileNo: string | null;
  referralDoctor: string | null;
  primaryConsultant: string | null;
  policyNumber: string | null;
  cardNumber: string | null;
  claimNumber: string | null;
  insurerName: string | null;
  tpaName: string | null;
  corporateName: string | null;
  requestedAmount: number;
  approvedAmount: number | null;
  status: PreAuthorizationStatus;
  decisionReason: string | null;
  raisedAt: string | null;
  raisedBy: string | null;
  decidedAt: string | null;
  approvedBy: string | null;
}
