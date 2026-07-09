import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BillingCategory } from './billing-category.model';

@Injectable({ providedIn: 'root' })
export class BillingCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing/categories`;

  list(): Observable<BillingCategory[]> {
    return this.http.get<BillingCategory[]>(this.baseUrl);
  }

  create(category: Pick<BillingCategory, 'name'>): Observable<BillingCategory> {
    return this.http.post<BillingCategory>(this.baseUrl, { name: category.name });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
