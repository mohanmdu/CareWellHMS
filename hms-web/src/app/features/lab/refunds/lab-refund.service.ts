import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LabRefundCandidate, LabRefundReceiptEntry, LabRefundRequest } from './lab-refund.model';

@Injectable({ providedIn: 'root' })
export class LabRefundService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/refunds`;

  search(invoiceNumber: number): Observable<LabRefundCandidate> {
    return this.http.get<LabRefundCandidate>(`${this.baseUrl}/search`, { params: { invoiceNumber } });
  }

  create(request: LabRefundRequest): Observable<LabRefundReceiptEntry> {
    return this.http.post<LabRefundReceiptEntry>(this.baseUrl, request);
  }

  get(id: number): Observable<LabRefundReceiptEntry> {
    return this.http.get<LabRefundReceiptEntry>(`${this.baseUrl}/${id}`);
  }

  getReport(from?: string, to?: string): Observable<LabRefundReceiptEntry[]> {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    return this.http.get<LabRefundReceiptEntry[]>(`${this.baseUrl}/report`, { params });
  }
}
