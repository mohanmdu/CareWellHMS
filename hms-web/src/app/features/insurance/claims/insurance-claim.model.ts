export type InsuranceClaimType = 'PRE_AUTHORIZATION' | 'ENHANCEMENT';
export type InsuranceClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface InsuranceClaim {
  id: number | null;
  claimNumber: string | null;
  patientId: number;
  patientName: string | null;
  policyNumber: string;
  insurerName: string;
  claimType: InsuranceClaimType;
  requestedAmount: number;
  approvedAmount: number | null;
  status: InsuranceClaimStatus;
  decisionReason: string | null;
}
