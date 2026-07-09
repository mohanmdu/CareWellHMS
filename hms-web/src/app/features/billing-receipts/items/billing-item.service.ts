import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BillingItem } from './billing-item.model';

export type BillingItemInput = Pick<BillingItem, 'name' | 'categoryId' | 'price'>;

@Injectable({ providedIn: 'root' })
export class BillingItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing/items`;

  list(): Observable<BillingItem[]> {
    return this.http.get<BillingItem[]>(this.baseUrl);
  }

  create(item: BillingItemInput): Observable<BillingItem> {
    return this.http.post<BillingItem>(this.baseUrl, item);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
