export type IcdVersion = 'ICD_10' | 'ICD_11';

export interface IcdCode {
  id: number;
  version: IcdVersion;
  code: string;
  diseaseName: string;
  chapter: string | null;
  category: string | null;
  whoVersion: string | null;
  shortDescription: string | null;
  active: boolean;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface IcdCodeInput {
  version: IcdVersion;
  code: string;
  diseaseName: string;
  chapter: string | null;
  category: string | null;
  whoVersion: string | null;
  shortDescription: string | null;
}

export interface IcdCodeImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export type DiagnosisType = 'PRIMARY' | 'SECONDARY' | 'FINAL' | 'PROVISIONAL';
export type DiagnosisStatus = 'ACTIVE' | 'RESOLVED' | 'CHRONIC';
export type DiagnosisSeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface PatientDiagnosis {
  id: number;
  patientId: number;
  patientUhid: string;
  patientName: string;
  icdCodeId: number;
  icdCode: string;
  diseaseName: string;
  icdVersion: string;
  diagnosisType: DiagnosisType;
  departmentId: number | null;
  departmentName: string | null;
  consultantId: number | null;
  consultantName: string | null;
  diagnosisDate: string;
  status: DiagnosisStatus;
  severity: DiagnosisSeverity | null;
  comments: string | null;
  clinicalNotes: string | null;
  addedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PatientDiagnosisInput {
  icdCodeId: number;
  diagnosisType: DiagnosisType;
  departmentId: number | null;
  consultantId: number | null;
  diagnosisDate: string;
  status: DiagnosisStatus;
  severity: DiagnosisSeverity | null;
  comments: string | null;
  clinicalNotes: string | null;
}

export type PatientType = 'OP' | 'IP';

export interface PatientVisitSummary {
  patientId: number;
  uhid: string;
  patientName: string;
  gender: string | null;
  age: number | null;
  mobileNumber: string;
  department: string | null;
  consultant: string | null;
  patientType: PatientType | null;
  visitNumber: string | null;
  lastVisitDate: string | null;
}

export const ICD_VERSIONS: IcdVersion[] = ['ICD_10', 'ICD_11'];
export const DIAGNOSIS_TYPES: DiagnosisType[] = ['PRIMARY', 'SECONDARY', 'FINAL', 'PROVISIONAL'];
export const DIAGNOSIS_STATUSES: DiagnosisStatus[] = ['ACTIVE', 'RESOLVED', 'CHRONIC'];
export const DIAGNOSIS_SEVERITIES: DiagnosisSeverity[] = ['MILD', 'MODERATE', 'SEVERE'];
