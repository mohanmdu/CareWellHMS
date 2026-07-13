import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RefundCandidate, RefundReceiptEntry, RefundReportFilter, RefundRequest } from './refund.model';

@Injectable({ providedIn: 'root' })
export class RefundService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/registration/refunds`;

  search(invoiceNumber: number): Observable<RefundCandidate> {
    return this.http.get<RefundCandidate>(`${this.baseUrl}/search`, {
      params: { invoiceNumber: String(invoiceNumber) }
    });
  }

  create(request: RefundRequest): Observable<RefundReceiptEntry> {
    return this.http.post<RefundReceiptEntry>(this.baseUrl, request);
  }

  getReport(filter?: RefundReportFilter): Observable<RefundReceiptEntry[]> {
    const params: Record<string, string> = {};
    if (filter?.fromDate) {
      params['fromDate'] = filter.fromDate;
    }
    if (filter?.toDate) {
      params['toDate'] = filter.toDate;
    }
    if (filter?.consultantId) {
      params['consultantId'] = String(filter.consultantId);
    }
    return this.http.get<RefundReceiptEntry[]>(`${this.baseUrl}/report`, { params });
  }
}
