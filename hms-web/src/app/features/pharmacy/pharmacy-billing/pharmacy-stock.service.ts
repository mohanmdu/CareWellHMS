import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PharmacyStock } from './pharmacy-stock.model';

@Injectable({ providedIn: 'root' })
export class PharmacyStockService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/stock`;

  list(): Observable<PharmacyStock[]> {
    return this.http.get<PharmacyStock[]>(this.baseUrl);
  }
}
