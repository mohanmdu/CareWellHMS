import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ApprovePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderListEntry,
  PurchaseOrderRequest,
  PurchaseOrderStatus
} from './purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/purchase-orders`;

  list(status: PurchaseOrderStatus): Observable<PurchaseOrderListEntry[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<PurchaseOrderListEntry[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  create(request: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.baseUrl, request);
  }

  approve(id: number, request: ApprovePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.baseUrl}/${id}/approve`, request);
  }

  cancel(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
