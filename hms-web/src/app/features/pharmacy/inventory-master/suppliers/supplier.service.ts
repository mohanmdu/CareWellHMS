import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Supplier } from './supplier.model';

export type SupplierInput = Pick<
  Supplier,
  'name' | 'contactPersonName' | 'mobileNumber' | 'address' | 'city' | 'landlineNumber'
>;

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/suppliers`;

  list(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.baseUrl);
  }

  listInactive(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/inactive`);
  }

  create(input: SupplierInput): Observable<Supplier> {
    return this.http.post<Supplier>(this.baseUrl, input);
  }

  update(id: number, input: SupplierInput): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
