import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DrugBatch } from './drug-batch.model';

export type DrugBatchInput = Omit<DrugBatch, 'id' | 'drugName'>;

@Injectable({ providedIn: 'root' })
export class DrugBatchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/batches`;

  list(): Observable<DrugBatch[]> {
    return this.http.get<DrugBatch[]>(this.baseUrl);
  }

  receiveStock(batch: DrugBatchInput): Observable<DrugBatch> {
    return this.http.post<DrugBatch>(this.baseUrl, batch);
  }
}
