import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacyReturn, PharmacyReturnInvoice, PharmacyReturnRequest, PharmacyReturnSummary } from './pharmacy-return.model';

/**
 * Named PharmacyReturnWorkflowService (not PharmacyReturnService) to avoid
 * confusion with the existing, untouched pharmacy-reports/pharmacy-return.service.ts,
 * which only backs the legacy read-only Return tab.
 */
@Injectable({ providedIn: 'root' })
export class PharmacyReturnWorkflowService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/returns`;

  searchInvoice(billNumber: number): Observable<PharmacyReturnInvoice> {
    return this.http.get<PharmacyReturnInvoice>(`${this.baseUrl}/invoice/${billNumber}`);
  }

  submit(request: PharmacyReturnRequest): Observable<PharmacyReturn> {
    return this.http.post<PharmacyReturn>(this.baseUrl, request);
  }

  listPending(fromDate?: string, toDate?: string): Observable<PharmacyReturnSummary[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<PharmacyReturnSummary[]>(`${this.baseUrl}/pending`, { params });
  }

  listReport(fromDate?: string, toDate?: string, locationId?: number): Observable<PharmacyReturnSummary[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (locationId) params = params.set('locationId', locationId);
    return this.http.get<PharmacyReturnSummary[]>(`${this.baseUrl}/report`, { params });
  }

  get(id: number): Observable<PharmacyReturn> {
    return this.http.get<PharmacyReturn>(`${this.baseUrl}/${id}`);
  }

  approve(id: number): Observable<PharmacyReturn> {
    return this.http.patch<PharmacyReturn>(`${this.baseUrl}/${id}/approve`, {});
  }
}
