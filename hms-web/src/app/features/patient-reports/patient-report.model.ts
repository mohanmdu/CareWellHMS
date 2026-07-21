export interface PatientReport {
  id: number;
  patientId: number;
  patientName: string;
  patientRegistrationNumber: string | null;
  patientMobileNumber: string;
  comments: string | null;
  filePath: string;
  originalFileName: string | null;
  fileType: string;
  uploadedBy: string | null;
  uploadedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
}

export interface PatientReportAuditLogRow {
  id: number;
  operation: string;
  patientUhid: string | null;
  patientName: string;
  doctorName: string | null;
  filePath: string;
  originalFileName: string | null;
  fileType: string;
  dateTime: string;
  createdBy: string | null;
}
