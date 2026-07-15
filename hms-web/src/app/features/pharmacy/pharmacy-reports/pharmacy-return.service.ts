import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacyReturnListEntry } from './pharmacy-return.model';

@Injectable({ providedIn: 'root' })
export class PharmacyReturnService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/returns`;

  search(fromDate?: string, toDate?: string): Observable<PharmacyReturnListEntry[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<PharmacyReturnListEntry[]>(this.baseUrl, { params });
  }

  create(saleItemId: number, quantity: number, remarks: string | null): Observable<PharmacyReturnListEntry> {
    return this.http.post<PharmacyReturnListEntry>(this.baseUrl, { saleItemId, quantity, remarks });
  }
}
