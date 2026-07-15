import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacySale, PharmacySaleListEntry, PharmacySaleRequest, PharmacySaleSource } from './pharmacy-sale.model';

export interface PharmacySaleSearchFilter {
  fromDate?: string;
  toDate?: string;
  source?: PharmacySaleSource;
  paymentMode?: string;
  locationId?: number;
  billedBy?: string;
}

@Injectable({ providedIn: 'root' })
export class PharmacySaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/sales`;

  search(filter?: PharmacySaleSearchFilter): Observable<PharmacySaleListEntry[]> {
    let params = new HttpParams();
    if (filter?.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter?.toDate) params = params.set('toDate', filter.toDate);
    if (filter?.source) params = params.set('source', filter.source);
    if (filter?.paymentMode) params = params.set('paymentMode', filter.paymentMode);
    if (filter?.locationId) params = params.set('locationId', filter.locationId);
    if (filter?.billedBy) params = params.set('billedBy', filter.billedBy);
    return this.http.get<PharmacySaleListEntry[]>(this.baseUrl, { params });
  }

  due(source?: PharmacySaleSource): Observable<PharmacySaleListEntry[]> {
    const params = source ? new HttpParams().set('source', source) : undefined;
    return this.http.get<PharmacySaleListEntry[]>(`${this.baseUrl}/due`, { params });
  }

  get(id: number): Observable<PharmacySale> {
    return this.http.get<PharmacySale>(`${this.baseUrl}/${id}`);
  }

  create(request: PharmacySaleRequest): Observable<PharmacySale> {
    return this.http.post<PharmacySale>(this.baseUrl, request);
  }
}
