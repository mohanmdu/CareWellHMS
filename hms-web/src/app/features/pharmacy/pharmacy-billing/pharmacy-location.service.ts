import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacyLocation } from './pharmacy-location.model';

@Injectable({ providedIn: 'root' })
export class PharmacyLocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/locations`;

  list(): Observable<PharmacyLocation[]> {
    return this.http.get<PharmacyLocation[]>(this.baseUrl);
  }

  listInactive(): Observable<PharmacyLocation[]> {
    return this.http.get<PharmacyLocation[]>(`${this.baseUrl}/inactive`);
  }

  create(name: string): Observable<PharmacyLocation> {
    return this.http.post<PharmacyLocation>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<PharmacyLocation> {
    return this.http.put<PharmacyLocation>(`${this.baseUrl}/${id}`, { name });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
