import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacyStock, StockBalanceEntry } from './pharmacy-stock.model';

@Injectable({ providedIn: 'root' })
export class PharmacyStockService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/stock`;

  list(): Observable<PharmacyStock[]> {
    return this.http.get<PharmacyStock[]>(this.baseUrl);
  }

  /** Rich multi-column autocomplete for Stock Adjustment / Batch-wise Stock Modifier / Purchase Return. */
  search(term: string): Observable<PharmacyStock[]> {
    return this.http.get<PharmacyStock[]>(this.baseUrl, { params: new HttpParams().set('search', term) });
  }

  updatePacking(stockId: number, quantityOnHand: number, packing: number): Observable<PharmacyStock> {
    return this.http.patch<PharmacyStock>(`${this.baseUrl}/${stockId}/packing`, { quantityOnHand, packing });
  }

  updateMrp(stockId: number, mrp: number): Observable<PharmacyStock> {
    return this.http.patch<PharmacyStock>(`${this.baseUrl}/${stockId}/mrp`, { mrp });
  }

  balanceReport(): Observable<StockBalanceEntry[]> {
    return this.http.get<StockBalanceEntry[]>(`${this.baseUrl}/balance-report`);
  }
}
