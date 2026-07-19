import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DischargeSummary, DischargeSummaryListRow } from './discharge-summary.model';

@Injectable({ providedIn: 'root' })
export class DischargeSummaryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/discharge-summary`;

  list(fromDate?: string, toDate?: string, billingType?: string): Observable<DischargeSummaryListRow[]> {
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
    return this.http.get<DischargeSummaryListRow[]>(`${this.baseUrl}/list`, { params });
  }

  getByAdmission(admissionId: number): Observable<DischargeSummary> {
    return this.http.get<DischargeSummary>(`${this.baseUrl}/admission/${admissionId}`);
  }

  save(admissionId: number, summary: DischargeSummary): Observable<DischargeSummary> {
    return this.http.put<DischargeSummary>(`${this.baseUrl}/admission/${admissionId}`, summary);
  }
}
