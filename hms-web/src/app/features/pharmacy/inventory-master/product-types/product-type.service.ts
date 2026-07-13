import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ProductType } from './product-type.model';

@Injectable({ providedIn: 'root' })
export class ProductTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/product-types`;

  list(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(this.baseUrl);
  }

  listInactive(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.baseUrl}/inactive`);
  }

  create(name: string): Observable<ProductType> {
    return this.http.post<ProductType>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<ProductType> {
    return this.http.put<ProductType>(`${this.baseUrl}/${id}`, { name });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
