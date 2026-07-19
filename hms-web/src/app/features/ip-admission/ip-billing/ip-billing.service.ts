import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IpBillingLedger,
  IpBillingLineItem,
  IpBillingLineItemEditInput,
  IpBillingLineItemInput,
  IpPayment
} from './ip-billing.model';

@Injectable({ providedIn: 'root' })
export class IpBillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ipbilling`;

  listLineItems(admissionId: number): Observable<IpBillingLineItem[]> {
    return this.http.get<IpBillingLineItem[]>(`${this.baseUrl}/admissions/${admissionId}/line-items`);
  }

  addLineItem(admissionId: number, input: IpBillingLineItemInput): Observable<IpBillingLineItem> {
    return this.http.post<IpBillingLineItem>(`${this.baseUrl}/admissions/${admissionId}/line-items`, input);
  }

  updateLineItem(id: number, input: IpBillingLineItemEditInput): Observable<IpBillingLineItem> {
    return this.http.put<IpBillingLineItem>(`${this.baseUrl}/line-items/${id}`, input);
  }

  deleteLineItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/line-items/${id}`);
  }

  getLedger(admissionId: number): Observable<IpBillingLedger> {
    return this.http.get<IpBillingLedger>(`${this.baseUrl}/admissions/${admissionId}/ledger`);
  }

  listPayments(admissionId: number): Observable<IpPayment[]> {
    return this.http.get<IpPayment[]>(`${this.baseUrl}/admissions/${admissionId}/payments`);
  }
}
