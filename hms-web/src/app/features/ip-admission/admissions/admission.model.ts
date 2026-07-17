export type AdmissionStatus = 'REGISTERED' | 'ADMITTED' | 'DISCHARGED';
export type AdmissionPaymentType = 'CASH' | 'INSURANCE' | 'CORPORATE';

export interface Admission {
  id: number | null;
  admissionNumber: string | null;
  patientId: number;
  patientName: string | null;
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
}

export type AdmissionRegistrationInput = Pick<
  Admission,
  | 'patientId'
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
