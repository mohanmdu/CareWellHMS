import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentRequest, PaymentRequestType } from './payment-request.model';

@Injectable({ providedIn: 'root' })
export class PaymentRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/cashier/payment-requests`;

  create(admissionId: number, requestType: PaymentRequestType, amount: number, description: string): Observable<PaymentRequest> {
    return this.http.post<PaymentRequest>(this.baseUrl, { admissionId, requestType, amount, description });
  }

  get(id: number): Observable<PaymentRequest> {
    return this.http.get<PaymentRequest>(`${this.baseUrl}/${id}`);
  }

  listPending(): Observable<PaymentRequest[]> {
    return this.http.get<PaymentRequest[]>(`${this.baseUrl}/pending`);
  }

  countPending(): Observable<{ ip: number }> {
    return this.http.get<{ ip: number }>(`${this.baseUrl}/pending/count`);
  }

  approve(id: number, paymentMode: string): Observable<PaymentRequest> {
    return this.http.patch<PaymentRequest>(`${this.baseUrl}/${id}/approve`, { paymentMode });
  }
}
