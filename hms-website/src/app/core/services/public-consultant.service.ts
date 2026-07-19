import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicConsultant } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicConsultantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/public/consultants`;

  list(departmentId?: number): Observable<PublicConsultant[]> {
    const params = departmentId ? new HttpParams().set('departmentId', departmentId) : undefined;
    return this.http.get<PublicConsultant[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<PublicConsultant> {
    return this.http.get<PublicConsultant>(`${this.baseUrl}/${id}`);
  }
}
