export const SUPPLIER_PAY_MODES = ['Cash', 'Cheque', 'Bank Transfer', 'Demand Draft'] as const;

export interface VendorOutstanding {
  supplierId: number;
  supplierName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

export interface InvoiceOutstanding {
  grnId: number;
  supplierId: number;
  supplierName: string;
  invoiceNo: string;
  invoiceDate: string;
  grnDate: string;
  totalAmount: number;
  paidAmount: number;
  amountToPay: number;
}

export interface SupplierPaymentHistory {
  id: number;
  paidBy: string | null;
  paidAt: string;
  payMode: string;
  transactionId: string | null;
  remarks: string | null;
  amount: number;
}

export interface SupplierPaymentRequest {
  amount: number;
  payMode: string;
  transactionId: string | null;
  remarks: string | null;
}

export interface SupplierOutstandingReportEntry {
  grnId: number;
  vendorName: string;
  date: string;
  invoiceNo: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
}
