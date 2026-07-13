import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OpDirectBillingListEntry,
  OpDirectBillingListFilter,
  OpDirectBillingReceipt,
  OpDirectBillingRequest
} from './op-direct-billing.model';

@Injectable({ providedIn: 'root' })
export class OpDirectBillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/registration/op-direct-billing`;

  create(request: OpDirectBillingRequest): Observable<OpDirectBillingReceipt> {
    return this.http.post<OpDirectBillingReceipt>(this.baseUrl, request);
  }

  get(id: number): Observable<OpDirectBillingReceipt> {
    return this.http.get<OpDirectBillingReceipt>(`${this.baseUrl}/${id}`);
  }

  list(filter?: OpDirectBillingListFilter): Observable<OpDirectBillingListEntry[]> {
    let params = new HttpParams();
    if (filter?.fromDate) {
      params = params.set('fromDate', filter.fromDate);
    }
    if (filter?.toDate) {
      params = params.set('toDate', filter.toDate);
    }
    return this.http.get<OpDirectBillingListEntry[]>(this.baseUrl, { params });
  }
}
