import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacyRequest, PharmacyRequestListEntry } from './pharmacy-request.model';

@Injectable({ providedIn: 'root' })
export class PharmacyRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/requests`;

  list(patientId?: number): Observable<PharmacyRequestListEntry[]> {
    const params = patientId ? new HttpParams().set('patientId', patientId) : undefined;
    return this.http.get<PharmacyRequestListEntry[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<PharmacyRequest> {
    return this.http.get<PharmacyRequest>(`${this.baseUrl}/${id}`);
  }
}
