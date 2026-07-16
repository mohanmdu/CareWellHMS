import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Product } from './product.model';

export type ProductInput = Pick<
  Product,
  | 'name'
  | 'productTypeId'
  | 'productCategory'
  | 'drugDosage'
  | 'drugType'
  | 'rackId'
  | 'manufacturerId'
  | 'medOrNonMed'
  | 'centralGst'
  | 'stateGst'
  | 'hsnSac'
  | 'scheduleType'
>;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/products`;

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  listInactive(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/inactive`);
  }

  create(input: ProductInput): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, input);
  }

  update(id: number, input: ProductInput): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
