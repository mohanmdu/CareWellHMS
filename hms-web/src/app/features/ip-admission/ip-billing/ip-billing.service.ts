import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdmissionReportRow,
  DischargeListRow,
  IpBillingLedger,
  IpBillingLineItem,
  IpBillingLineItemEditInput,
  IpBillingLineItemInput,
  IpConsultantWiseReportRow,
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

  getConsultantWiseReport(fromDate?: string, toDate?: string, consultantId?: number): Observable<IpConsultantWiseReportRow[]> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (consultantId) {
      params = params.set('consultantId', consultantId);
    }
    return this.http.get<IpConsultantWiseReportRow[]>(`${this.baseUrl}/reports/consultant-wise`, { params });
  }

  getAdmissionReport(fromDate?: string, toDate?: string, paymentType?: string): Observable<AdmissionReportRow[]> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (paymentType) {
      params = params.set('paymentType', paymentType);
    }
    return this.http.get<AdmissionReportRow[]>(`${this.baseUrl}/reports/admission`, { params });
  }

  getDischargeList(fromDate?: string, toDate?: string, billingType?: string): Observable<DischargeListRow[]> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (billingType) {
      params = params.set('billingType', billingType);
    }
    return this.http.get<DischargeListRow[]>(`${this.baseUrl}/reports/discharge-list`, { params });
  }
}
