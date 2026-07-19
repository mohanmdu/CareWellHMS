export interface ActivityLog {
  id: number;
  patientUhid: string | null;
  patientName: string | null;
  opNumber: string | null;
  ipNumber: string | null;
  module: string;
  screenName: string | null;
  operation: string;
  content: string | null;
  previousContent: string | null;
  performedBy: string;
  performedAt: string;
  status: string;
  remarks: string | null;
}

export interface ActivityLogSearchParams {
  fromDate?: string;
  toDate?: string;
  patientUhid?: string;
  patientName?: string;
  opNumber?: string;
  ipNumber?: string;
  module?: string;
  operation?: string;
  performedBy?: string;
  status?: string;
}

export const ACTIVITY_LOG_MODULES = [
  'Patient Registration',
  'OP Billing',
  'IP Billing',
  'Admission',
  'Discharge',
  'Pharmacy Billing',
  'Laboratory',
  'Radiology',
  'Insurance',
  'Advance Payment',
  'Refund',
  'ICD Diagnosis'
];

export const ACTIVITY_LOG_OPERATIONS = [
  'Create',
  'Update',
  'Delete',
  'Cancel',
  'Approve',
  'Print',
  'Generate Invoice',
  'Payment Received',
  'Refund Processed',
  'Discharge Completed'
];

export const ACTIVITY_LOG_STATUSES = ['Success', 'Updated', 'Cancelled', 'Deleted', 'Approved', 'Pending'];
