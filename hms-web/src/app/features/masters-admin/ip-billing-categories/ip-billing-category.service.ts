import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RevenueBucket } from '../../../shared/revenue-bucket.model';
import { IpBillingCategory } from './ip-billing-category.model';

@Injectable({ providedIn: 'root' })
export class IpBillingCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/ip-billing-categories`;

  list(): Observable<IpBillingCategory[]> {
    return this.http.get<IpBillingCategory[]>(this.baseUrl);
  }

  listInactive(): Observable<IpBillingCategory[]> {
    return this.http.get<IpBillingCategory[]>(`${this.baseUrl}/inactive`);
  }

  create(name: string): Observable<IpBillingCategory> {
    return this.http.post<IpBillingCategory>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<IpBillingCategory> {
    return this.http.put<IpBillingCategory>(`${this.baseUrl}/${id}`, { name });
  }

  updateRevenueBucket(id: number, revenueBucket: RevenueBucket): Observable<IpBillingCategory> {
    return this.http.patch<IpBillingCategory>(`${this.baseUrl}/${id}/revenue-bucket`, { revenueBucket });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
