import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacySale } from './pharmacy-sale.model';

export interface PharmacySaleCreateRequest {
  patientId: number;
  items: { batchId: number; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class PharmacySaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/sales`;

  list(): Observable<PharmacySale[]> {
    return this.http.get<PharmacySale[]>(this.baseUrl);
  }

  create(request: PharmacySaleCreateRequest): Observable<PharmacySale> {
    return this.http.post<PharmacySale>(this.baseUrl, request);
  }
}
