import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CeoIpRevenue, CeoIpSummary, CeoOpRevenue, CeoOpSummary } from './ceo-dashboard.model';

/** 4 independent endpoints (one per quadrant) - see CeoDashboardController's doc comment for why not one combined call. */
@Injectable({ providedIn: 'root' })
export class CeoDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/reports/ceo-dashboard`;

  private dateParams(fromDate: string | null, toDate: string | null): HttpParams {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    return params;
  }

  ipSummary(fromDate: string | null, toDate: string | null): Observable<CeoIpSummary> {
    return this.http.get<CeoIpSummary>(`${this.baseUrl}/ip-summary`, { params: this.dateParams(fromDate, toDate) });
  }

  opSummary(fromDate: string | null, toDate: string | null): Observable<CeoOpSummary> {
    return this.http.get<CeoOpSummary>(`${this.baseUrl}/op-summary`, { params: this.dateParams(fromDate, toDate) });
  }

  ipRevenue(fromDate: string | null, toDate: string | null): Observable<CeoIpRevenue> {
    return this.http.get<CeoIpRevenue>(`${this.baseUrl}/ip-revenue`, { params: this.dateParams(fromDate, toDate) });
  }

  opRevenue(fromDate: string | null, toDate: string | null): Observable<CeoOpRevenue> {
    return this.http.get<CeoOpRevenue>(`${this.baseUrl}/op-revenue`, { params: this.dateParams(fromDate, toDate) });
  }
}
