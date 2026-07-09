import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Consultant } from './consultant.model';

export type ConsultantInput = Omit<Consultant, 'id' | 'departmentName' | 'active'>;

@Injectable({ providedIn: 'root' })
export class ConsultantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/consultants`;

  list(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(this.baseUrl);
  }

  create(consultant: ConsultantInput): Observable<Consultant> {
    return this.http.post<Consultant>(this.baseUrl, consultant);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
