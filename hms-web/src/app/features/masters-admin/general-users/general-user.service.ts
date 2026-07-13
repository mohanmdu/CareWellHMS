import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GeneralUser, GeneralUserAuditLogEntry } from './general-user.model';

export type GeneralUserInput = Pick<GeneralUser, 'name' | 'mobileNumber' | 'email' | 'roleId'>;

@Injectable({ providedIn: 'root' })
export class GeneralUserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/general-users`;

  /** Active users only. */
  list(): Observable<GeneralUser[]> {
    return this.http.get<GeneralUser[]>(this.baseUrl);
  }

  listInactive(): Observable<GeneralUser[]> {
    return this.http.get<GeneralUser[]>(`${this.baseUrl}/inactive`);
  }

  create(user: GeneralUserInput): Observable<GeneralUser> {
    return this.http.post<GeneralUser>(this.baseUrl, user);
  }

  update(id: number, user: GeneralUserInput): Observable<GeneralUser> {
    return this.http.put<GeneralUser>(`${this.baseUrl}/${id}`, user);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  auditLogs(): Observable<GeneralUserAuditLogEntry[]> {
    return this.http.get<GeneralUserAuditLogEntry[]>(`${this.baseUrl}/audit-logs`);
  }
}
