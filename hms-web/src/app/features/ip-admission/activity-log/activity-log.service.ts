import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActivityLog, ActivityLogSearchParams } from './activity-log.model';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/activity-log`;

  search(searchParams: ActivityLogSearchParams): Observable<ActivityLog[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return this.http.get<ActivityLog[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<ActivityLog> {
    return this.http.get<ActivityLog>(`${this.baseUrl}/${id}`);
  }
}
