export type LabBillingType = 'CASH' | 'CREDIT';

export type LabPaymentMode = 'CASH' | 'CARD' | 'CHEQUE_DD' | 'ONLINE_FUND_TRANSFER' | 'UPI' | 'CREDIT_PATIENT';

export const LAB_PAYMENT_MODES: LabPaymentMode[] = ['CASH', 'CARD', 'CHEQUE_DD', 'ONLINE_FUND_TRANSFER', 'UPI', 'CREDIT_PATIENT'];

export const LAB_PAYMENT_MODE_LABELS: Record<LabPaymentMode, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  CHEQUE_DD: 'Cheque/DD',
  ONLINE_FUND_TRANSFER: 'Online Fund Transfer',
  UPI: 'UPI',
  CREDIT_PATIENT: 'Credit Patient'
};

export interface LabTestOption {
  subCategoryId: number;
  subCategoryName: string;
  opAmount: number;
  ipAmount: number;
}

export interface LabCategoryTestGroup {
  categoryId: number;
  categoryName: string;
  tests: LabTestOption[];
}

export interface LabRequisitionItem {
  id: number;
  subCategoryId: number | null;
  categoryName: string;
  subCategoryName: string;
  amount: number;
}

export interface LabRequisition {
  id: number;
  requisitionNumber: string;
  requisitionType: string;
  patientId: number;
  patientUhid: string;
  patientName: string;
  age: number | null;
  gender: string | null;
  patientRegType: string;
  patientType: string;
  billingType: string;
  consultantId: number | null;
  consultantName: string | null;
  totalAmount: number;
  status: string;
  requisitionDate: string;
  createdBy: string | null;
  invoiceNumber: number | null;
  paidAmount: number | null;
  discountAmount: number | null;
  paymentMode: string | null;
  remarks: string | null;
  items: LabRequisitionItem[];
}

export interface LabRequisitionAdHocItemInput {
  componentId: number;
  quantity: number;
  discount: number | null;
}

export interface LabRequisitionCreateInput {
  patientId: number;
  consultantId: number | null;
  billingType: LabBillingType;
  subCategoryIds?: number[];
  adHocItems?: LabRequisitionAdHocItemInput[];
}

export interface LabRequisitionListRow {
  id: number;
  patientUhid: string;
  patientName: string;
  patientType: string;
  requisitionType: string;
  requisitionDate: string;
  invoiceAmount: number;
  createdBy: string | null;
}

export interface LabRequisitionApproveInput {
  paidAmount: number;
  discountAmount: number;
  paymentMode: LabPaymentMode;
  remarks: string | null;
}
