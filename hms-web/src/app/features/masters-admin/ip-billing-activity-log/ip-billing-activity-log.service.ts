import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IpBillingActivityLogEntry } from './ip-billing-activity-log.model';

@Injectable({ providedIn: 'root' })
export class IpBillingActivityLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/ip-billing-components/activity-log`;

  search(fromDate?: string, toDate?: string): Observable<IpBillingActivityLogEntry[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<IpBillingActivityLogEntry[]>(this.baseUrl, { params });
  }
}
