import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Manufacturer } from './manufacturer.model';

export type ManufacturerInput = Pick<
  Manufacturer,
  'name' | 'contactPersonName' | 'phoneNumber' | 'address' | 'city' | 'state'
>;

@Injectable({ providedIn: 'root' })
export class ManufacturerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/manufacturers`;

  list(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>(this.baseUrl);
  }

  listInactive(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>(`${this.baseUrl}/inactive`);
  }

  create(input: ManufacturerInput): Observable<Manufacturer> {
    return this.http.post<Manufacturer>(this.baseUrl, input);
  }

  update(id: number, input: ManufacturerInput): Observable<Manufacturer> {
    return this.http.put<Manufacturer>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
