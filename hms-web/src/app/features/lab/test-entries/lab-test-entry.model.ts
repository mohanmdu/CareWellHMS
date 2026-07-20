export const SPECIMEN_TYPES = ['Blood', 'Urine', 'Stool', 'Fluids', 'Sputum', 'Semen', 'Tissues', 'Others'];

export interface LabTestEntryListRow {
  id: number;
  patientUhid: string;
  patientName: string;
  gender: string | null;
  status: string;
  mobileNumber: string;
  createdBy: string | null;
  requestedTime: string;
}

export interface LabApprovedListRow {
  id: number;
  patientUhid: string;
  patientName: string;
  mobileNumber: string;
  consultantName: string | null;
  patientType: string;
  gender: string | null;
  updatedBy: string | null;
  requestedTime: string;
}

export interface LabTestResult {
  componentId: number;
  subCategoryName: string;
  componentName: string;
  sampleType: string | null;
  method: string | null;
  normalRange: string | null;
  units: string | null;
  maleRangeFrom: string | null;
  maleRangeTo: string | null;
  femaleRangeFrom: string | null;
  femaleRangeTo: string | null;
  resultValue: string | null;
  abnormal: boolean;
}

export interface LabTestEntry {
  id: number;
  patientUhid: string;
  patientName: string;
  age: number | null;
  gender: string | null;
  mobileNumber: string;
  consultantName: string | null;
  status: string;
  specimenTypes: string;
  reportedDate: string | null;
  remarks: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  results: LabTestResult[];
}

export interface LabTestResultInput {
  componentId: number;
  resultValue: string | null;
  abnormal: boolean;
}

export interface LabTestEntrySaveInput {
  specimenTypes: string[];
  reportedDate: string | null;
  remarks: string | null;
  results: LabTestResultInput[];
}
