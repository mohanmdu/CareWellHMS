export type InvoiceStatus = 'DRAFT' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface InvoiceLineItem {
  id: number | null;
  billingItemId: number;
  itemName: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface Invoice {
  id: number | null;
  invoiceNumber: string | null;
  patientId: number;
  patientName: string | null;
  appointmentId: number | null;
  status: InvoiceStatus;
  totalAmount: number | null;
  cancellationReason: string | null;
  lineItems: InvoiceLineItem[];
}
