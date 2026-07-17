import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InvoiceOutstanding,
  SupplierPaymentHistory,
  SupplierPaymentRequest,
  VendorOutstanding
} from './supplier-payment.model';

@Injectable({ providedIn: 'root' })
export class SupplierPaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/supplier-payments`;

  vendorOutstanding(): Observable<VendorOutstanding[]> {
    return this.http.get<VendorOutstanding[]>(`${this.baseUrl}/vendors`);
  }

  invoicesForVendor(supplierId: number): Observable<InvoiceOutstanding[]> {
    return this.http.get<InvoiceOutstanding[]>(`${this.baseUrl}/vendors/${supplierId}/invoices`);
  }

  paymentHistory(grnId: number): Observable<SupplierPaymentHistory[]> {
    return this.http.get<SupplierPaymentHistory[]>(`${this.baseUrl}/invoices/${grnId}/history`);
  }

  payAll(supplierId: number, request: SupplierPaymentRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/vendors/${supplierId}/pay-all`, request);
  }

  paySelected(grnIds: number[], request: SupplierPaymentRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/pay-selected`, { grnIds, payment: request });
  }

  payInvoice(grnId: number, request: SupplierPaymentRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/invoices/${grnId}/pay`, request);
  }
}
