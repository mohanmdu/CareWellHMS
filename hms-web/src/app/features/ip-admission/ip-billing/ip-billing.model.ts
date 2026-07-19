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

export interface IpBillingLedger {
  rows: IpBillingLedgerRow[];
  netInvoiced: number;
  netDiscount: number;
  netRefund: number;
  netTotal: number;
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
