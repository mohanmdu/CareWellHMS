import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PharmacyPurchaseReturn,
  PharmacyPurchaseReturnEligibleItem,
  PharmacyPurchaseReturnRequest,
  PharmacyPurchaseReturnSummary
} from './purchase-return.model';

@Injectable({ providedIn: 'root' })
export class PurchaseReturnService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/purchase-returns`;

  eligibleStock(
    supplierId?: number,
    drugName?: string,
    fromDate?: string,
    toDate?: string
  ): Observable<PharmacyPurchaseReturnEligibleItem[]> {
    let params = new HttpParams();
    if (supplierId) params = params.set('supplierId', supplierId);
    if (drugName) params = params.set('drugName', drugName);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<PharmacyPurchaseReturnEligibleItem[]>(`${this.baseUrl}/eligible-stock`, { params });
  }

  create(request: PharmacyPurchaseReturnRequest): Observable<PharmacyPurchaseReturn> {
    return this.http.post<PharmacyPurchaseReturn>(this.baseUrl, request);
  }

  get(id: number): Observable<PharmacyPurchaseReturn> {
    return this.http.get<PharmacyPurchaseReturn>(`${this.baseUrl}/${id}`);
  }

  search(fromDate?: string, toDate?: string): Observable<PharmacyPurchaseReturnSummary[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<PharmacyPurchaseReturnSummary[]>(this.baseUrl, { params });
  }
}
