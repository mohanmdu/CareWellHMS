import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DiReportEntry,
  DrugScheduleFilterType,
  PharmacyStatementEntry,
  PurchaseGstEntry,
  SalesGstEntry,
  SalesReturnGstEntry,
  TaxStatementEntry
} from './pharmacy-statement-report.model';

@Injectable({ providedIn: 'root' })
export class PharmacyStatementReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/reports`;

  private dateParams(fromDate?: string, toDate?: string): HttpParams {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return params;
  }

  cashStatement(fromDate?: string, toDate?: string): Observable<PharmacyStatementEntry[]> {
    return this.http.get<PharmacyStatementEntry[]>(`${this.baseUrl}/cash-statement`, { params: this.dateParams(fromDate, toDate) });
  }

  vatStatement(fromDate?: string, toDate?: string): Observable<TaxStatementEntry[]> {
    return this.http.get<TaxStatementEntry[]>(`${this.baseUrl}/vat-statement`, { params: this.dateParams(fromDate, toDate) });
  }

  gstStatement(fromDate?: string, toDate?: string): Observable<TaxStatementEntry[]> {
    return this.http.get<TaxStatementEntry[]>(`${this.baseUrl}/gst-statement`, { params: this.dateParams(fromDate, toDate) });
  }

  salesGst(fromDate?: string, toDate?: string, gstPercent?: number): Observable<SalesGstEntry[]> {
    let params = this.dateParams(fromDate, toDate);
    if (gstPercent !== undefined && gstPercent !== null) params = params.set('gstPercent', gstPercent);
    return this.http.get<SalesGstEntry[]>(`${this.baseUrl}/sales-gst`, { params });
  }

  salesReturnGst(fromDate?: string, toDate?: string, gstPercent?: number): Observable<SalesReturnGstEntry[]> {
    let params = this.dateParams(fromDate, toDate);
    if (gstPercent !== undefined && gstPercent !== null) params = params.set('gstPercent', gstPercent);
    return this.http.get<SalesReturnGstEntry[]>(`${this.baseUrl}/sales-return-gst`, { params });
  }

  purchaseGst(fromDate?: string, toDate?: string, gstPercent?: number): Observable<PurchaseGstEntry[]> {
    let params = this.dateParams(fromDate, toDate);
    if (gstPercent !== undefined && gstPercent !== null) params = params.set('gstPercent', gstPercent);
    return this.http.get<PurchaseGstEntry[]>(`${this.baseUrl}/purchase-gst`, { params });
  }

  diReport(
    fromDate?: string,
    toDate?: string,
    type?: DrugScheduleFilterType,
    patientId?: number,
    nameOrMobile?: string
  ): Observable<DiReportEntry[]> {
    let params = this.dateParams(fromDate, toDate);
    if (type) params = params.set('type', type);
    if (patientId) params = params.set('patientId', patientId);
    if (nameOrMobile) params = params.set('nameOrMobile', nameOrMobile);
    return this.http.get<DiReportEntry[]>(`${this.baseUrl}/di`, { params });
  }
}
