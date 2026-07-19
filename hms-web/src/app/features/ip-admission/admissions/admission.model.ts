export type AdmissionStatus = 'REGISTERED' | 'ADMITTED' | 'DISCHARGE_INITIATED' | 'DISCHARGED' | 'CANCELLED';
export type AdmissionPaymentType = 'CASH' | 'INSURANCE' | 'CORPORATE';

export const DISCHARGE_TYPE_OPTIONS = ['Regular Discharge', 'Death', 'Against Medical Advice', 'Absconding'];

export interface Admission {
  id: number | null;
  admissionNumber: string | null;
  patientId: number;
  patientName: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientAge: number | null;
  patientMobileNumber: string | null;
  patientAddress: string | null;
  roomId: number | null;
  roomNumber: string | null;
  roomTypeId: number | null;
  roomTypeName: string | null;
  admissionDate: string | null;
  status: AdmissionStatus;
  advanceAmount: number | null;
  totalBilled: number | null;
  settlementAmount: number | null;
  dischargeDate: string | null;
  dischargeSummary: string | null;
  dischargeType: string | null;
  dischargeNumber: string | null;
  attenderName: string | null;
  relationType: string | null;
  fatherSpouseName: string | null;
  relationMobileNo: string | null;
  occupation: string | null;
  maritalStatus: string | null;
  periodOfStayDays: number | null;
  descriptionOfCase: string | null;
  referralDoctor: string | null;
  primaryConsultant: string | null;
  secondaryConsultant: string | null;
  paymentType: AdmissionPaymentType | null;
  heightCm: number | null;
  weightKg: number | null;
  mlc: boolean;
  insuranceType: string | null;
  patientType: string | null;
  remarks: string | null;
  aadhaarNumber: string | null;
  ventilatorRequired: boolean;
  monitorRequired: boolean;
  photoPath: string | null;
  createdBy: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
}

export type AdmissionRegistrationInput = Pick<
  Admission,
  | 'patientId'
  | 'admissionDate'
  | 'roomTypeId'
  | 'attenderName'
  | 'relationType'
  | 'fatherSpouseName'
  | 'relationMobileNo'
  | 'occupation'
  | 'maritalStatus'
  | 'periodOfStayDays'
  | 'descriptionOfCase'
  | 'referralDoctor'
  | 'primaryConsultant'
  | 'secondaryConsultant'
  | 'paymentType'
  | 'heightCm'
  | 'weightKg'
  | 'mlc'
  | 'insuranceType'
  | 'patientType'
  | 'remarks'
  | 'aadhaarNumber'
  | 'ventilatorRequired'
  | 'monitorRequired'
>;

/** Ward Allocation step: edit intake details, assign a room, record an initial advance, and admit. */
export type AdmissionAdmitInput = Pick<
  Admission,
  | 'patientId'
  | 'admissionDate'
  | 'roomId'
  | 'attenderName'
  | 'relationType'
  | 'fatherSpouseName'
  | 'relationMobileNo'
  | 'occupation'
  | 'maritalStatus'
  | 'periodOfStayDays'
  | 'descriptionOfCase'
  | 'referralDoctor'
  | 'primaryConsultant'
  | 'secondaryConsultant'
  | 'paymentType'
  | 'heightCm'
  | 'weightKg'
  | 'mlc'
  | 'insuranceType'
  | 'patientType'
  | 'remarks'
  | 'aadhaarNumber'
  | 'ventilatorRequired'
  | 'monitorRequired'
  | 'advanceAmount'
>;
