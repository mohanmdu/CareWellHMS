import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RevenueBucket } from '../../../shared/revenue-bucket.model';
import { OpBillingCategory } from './op-billing-category.model';

@Injectable({ providedIn: 'root' })
export class OpBillingCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/op-billing-categories`;

  list(): Observable<OpBillingCategory[]> {
    return this.http.get<OpBillingCategory[]>(this.baseUrl);
  }

  listInactive(): Observable<OpBillingCategory[]> {
    return this.http.get<OpBillingCategory[]>(`${this.baseUrl}/inactive`);
  }

  create(name: string): Observable<OpBillingCategory> {
    return this.http.post<OpBillingCategory>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<OpBillingCategory> {
    return this.http.put<OpBillingCategory>(`${this.baseUrl}/${id}`, { name });
  }

  updateRevenueBucket(id: number, revenueBucket: RevenueBucket): Observable<OpBillingCategory> {
    return this.http.patch<OpBillingCategory>(`${this.baseUrl}/${id}/revenue-bucket`, { revenueBucket });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
