import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Invoice } from './invoice.model';

export interface InvoiceCreateRequest {
  patientId: number;
  appointmentId: number | null;
  lineItems: { billingItemId: number; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing/invoices`;

  list(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseUrl);
  }

  create(request: InvoiceCreateRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.baseUrl, request);
  }

  pay(id: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.baseUrl}/${id}/pay`, {});
  }

  cancel(id: number, reason: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
