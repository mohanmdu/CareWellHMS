export interface IpBillingLineItem {
  id: number | null;
  admissionId: number;
  categoryId: number;
  categoryName: string | null;
  consultantId: number | null;
  consultantName: string | null;
  componentId: number;
  componentName: string | null;
  remarks: string | null;
  quantity: number;
  unitAmount: number;
  units: string | null;
  lineTotal: number;
  discountAmount: number;
  refundAmount: number;
  discountReason: string | null;
  requestedOn: string | null;
  createdBy: string | null;
}

export type IpBillingLineItemInput = Pick<
  IpBillingLineItem,
  'categoryId' | 'consultantId' | 'componentId' | 'remarks' | 'quantity' | 'unitAmount' | 'units'
>;

export type IpBillingLineItemEditInput = Partial<
  Pick<IpBillingLineItem, 'remarks' | 'quantity' | 'unitAmount' | 'discountAmount' | 'refundAmount' | 'discountReason'>
>;

export interface IpBillingLedgerRow {
  category: string;
  invoiced: number;
  discount: number;
  refund: number;
  net: number;
  lineItems: IpBillingLineItem[];
}

export interface WardStay {
  roomNumber: string;
  roomTypeName: string;
  dayCount: number;
  invoicedAmount: number;
}

/** One Lab/Investigation charge pulled in from the Lab module for the "Lab & Investigation Charges" row. */
export interface IpBillingLabCharge {
  categoryName: string;
  subCategoryName: string;
  requestedOn: string | null;
  invoicedAmount: number;
  requisitionNumber: string;
  createdBy: string | null;
}

export interface IpBillingLedger {
  rows: IpBillingLedgerRow[];
  netInvoiced: number;
  netDiscount: number;
  netRefund: number;
  netTotal: number;
  wardStays: WardStay[];
  labCharges: IpBillingLabCharge[];
}

export interface IpPayment {
  id: number;
  admissionId: number;
  paymentDate: string;
  receiptNumber: string;
  description: string | null;
  paymentType: string | null;
  invoicedAmount: number;
  refundAmount: number;
  netAmount: number;
  createdBy: string | null;
}

export interface IpConsultantWiseReportRow {
  consultantId: number | null;
  consultantName: string;
  specializationName: string | null;
  amount: number;
}

export interface AdmissionReportRow {
  admissionId: number;
  admissionNumber: string | null;
  patientUhid: string | null;
  patientName: string | null;
  patientGender: string | null;
  paymentType: string | null;
  admissionDate: string | null;
  dischargeDate: string | null;
  roomNumber: string | null;
  roomTypeName: string | null;
  invoiceAmount: number;
  amountPaid: number;
}

export interface DischargeListRow {
  admissionId: number;
  admissionNumber: string | null;
  patientUhid: string | null;
  patientName: string | null;
  patientGender: string | null;
  billingType: string | null;
  insuranceType: string | null;
  admissionDate: string | null;
  dischargeDate: string | null;
  invoicedAmount: number;
  paidAmount: number;
  refundAmount: number;
  discountAmount: number;
  balanceAmount: number;
}

export interface CancelledAdmissionRow {
  admissionId: number;
  patientUhid: string | null;
  patientName: string | null;
  admissionNumber: string | null;
  caseDescription: string | null;
  paymentType: string | null;
  primaryConsultant: string | null;
  referralDoctor: string | null;
  wardType: string | null;
  createdAt: string | null;
  createdBy: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  refundStatus: string;
}

export interface CancelledAdmissionDetail {
  admissionId: number;
  admissionNumber: string | null;
  patientUhid: string | null;
  patientName: string | null;
  patientGender: string | null;
  patientAge: number | null;
  patientMobileNumber: string | null;
  patientAddress: string | null;
  admissionDate: string | null;
  cancelledAt: string | null;
  wardType: string | null;
  bedNumber: string | null;
  primaryConsultant: string | null;
  referralDoctor: string | null;
  paymentType: string | null;
  admissionStatus: string;
  cancellationReason: string | null;
  cancelledBy: string | null;
  remarks: string | null;
  createdAt: string | null;
  createdBy: string | null;
  admissionCharges: number;
  advanceAmount: number;
  refundAmount: number;
  balanceAmount: number;
  refundStatus: string;
}
