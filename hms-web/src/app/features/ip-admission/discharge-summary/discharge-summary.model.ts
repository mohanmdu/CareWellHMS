export type AdviseType = 'REGULAR' | 'SOS';

export interface DischargeSummaryListRow {
  admissionId: number;
  admissionNumber: string;
  patientUhid: string | null;
  patientName: string;
  patientGender: string | null;
  insuranceType: string | null;
  admissionDate: string;
  dischargeDate: string | null;
  surgery: string | null;
  dischargeSummaryId: number | null;
}

export interface DischargeInitiatedRow {
  admissionId: number;
  admissionNumber: string;
  patientUhid: string | null;
  patientName: string;
  gender: string | null;
  age: number | null;
  mobileNumber: string | null;
  address: string | null;
  admissionDate: string;
  paymentType: string | null;
  wardLocation: string | null;
  diagnosis: string | null;
  primaryConsultant: string | null;
}

export interface DischargeSurgeryProcedure {
  id: number | null;
  procedureName: string | null;
  surgeonName: string | null;
  assistantSurgeonName: string | null;
  anaesthetistName: string | null;
  dateOfSurgery: string | null;
}

export interface DischargeAdviseDrug {
  id: number | null;
  drugName: string;
  adviseType: AdviseType;
  dose: string | null;
  morning: string | null;
  afternoon: string | null;
  evening: string | null;
  night: string | null;
  route: string | null;
  relationshipWithMeal: string | null;
  duration: string | null;
}

export interface DischargeSummary {
  id: number | null;
  admissionId: number;
  patientUhid: string | null;
  patientName: string;
  gender: string | null;
  age: number | null;
  mobileNumber: string | null;
  address: string | null;
  admissionNumber: string;
  roomNumber: string | null;
  admissionDate: string;
  dischargeDate: string | null;
  maritalStatus: string | null;
  occupation: string | null;
  primaryConsultant: string | null;

  consultants: string[];
  referredBy: string | null;
  weightKg: number | null;
  rcnNo: string | null;
  title: string | null;
  bloodGroup: string | null;
  diagnosis: string[];
  procedures: string[];

  briefHistory: string | null;
  pastHistory: string | null;
  personalHistory: string | null;
  surgicalHistory: string | null;
  familyHistory: string | null;
  intolerance: string | null;
  immunization: string | null;
  menstrualHistory: string | null;
  maritalHistory: string | null;
  obstetricHistory: string | null;

  generalExamination: string | null;
  tempF: string | null;
  pr: string | null;
  bp: string | null;
  rr: string | null;
  spo2: string | null;
  cbg: string | null;
  cvs: string | null;
  rs: string | null;
  abdomen: string | null;
  cns: string | null;
  localExamination: string | null;

  investigationXray: string | null;
  investigationEcg: string | null;
  investigationEcho: string | null;
  investigationTmt: string | null;
  investigationUsgAbdomen: string | null;
  investigationUsgPelvis: string | null;
  investigationEndoscopy: string | null;
  investigationColonoscopy: string | null;
  investigationSigmoidoscopy: string | null;
  investigationMriScan: string | null;
  investigationDopplerStudy: string | null;
  investigationNerveConduction: string | null;

  bloodInvestigationDate: string | null;
  hemoglobin: string | null;
  bloodUrea: string | null;
  srCreatinine: string | null;
  sodium: string | null;
  potassium: string | null;
  hba1c: string | null;
  orEnclosed: string | null;

  angiogramDate: string | null;
  angiogramSite: string | null;
  angiogramArtery: string | null;
  angiogramProcedure: string | null;
  lmca: string | null;
  lad: string | null;
  lcx: string | null;
  rca: string | null;
  impression: string[];
  recommendation: string | null;
  treatmentGiven: string | null;

  surgeryProcedures: DischargeSurgeryProcedure[];
  courseInHospital: string | null;

  adviseDrugs: DischargeAdviseDrug[];

  review: string | null;
  dietAdvice: string | null;
  physiotherapy: string | null;
  physicalActivity: string | null;
  advice: string | null;
  reviewDescription: string | null;
  conditionAtDischarge: string | null;
  emergencyContactNumbers: string | null;
  emergencySymptoms: string[];
  checkedBy: string | null;
  consultantSignOff: string | null;
}
