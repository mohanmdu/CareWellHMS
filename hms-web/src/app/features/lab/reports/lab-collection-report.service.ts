import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LabCancelledReportRow, LabCollectionReport, LabCollectionReportDetailFilters } from './lab-collection-report.model';

function buildDetailParams(filters: LabCollectionReportDetailFilters): HttpParams {
  let params = new HttpParams();
  if (filters.from) {
    params = params.set('from', filters.from);
  }
  if (filters.to) {
    params = params.set('to', filters.to);
  }
  if (filters.consultantId) {
    params = params.set('consultantId', filters.consultantId);
  }
  if (filters.categoryId) {
    params = params.set('categoryId', filters.categoryId);
  }
  if (filters.paymentMode) {
    params = params.set('paymentMode', filters.paymentMode);
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class LabCollectionReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/reports/collection`;

  getSummary(from?: string, to?: string): Observable<LabCollectionReport> {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    return this.http.get<LabCollectionReport>(`${this.baseUrl}/summary`, { params });
  }

  getLabDetail(filters: LabCollectionReportDetailFilters): Observable<LabCollectionReport> {
    return this.http.get<LabCollectionReport>(`${this.baseUrl}/lab-detail`, { params: buildDetailParams(filters) });
  }

  getInvestigationDetail(filters: LabCollectionReportDetailFilters): Observable<LabCollectionReport> {
    return this.http.get<LabCollectionReport>(`${this.baseUrl}/investigation-detail`, { params: buildDetailParams(filters) });
  }

  getCancelled(): Observable<LabCancelledReportRow[]> {
    return this.http.get<LabCancelledReportRow[]>(`${this.baseUrl}/cancelled`);
  }
}
