import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Drug } from './drug.model';

export type DrugInput = Pick<Drug, 'name' | 'genericName' | 'manufacturer' | 'unitOfMeasure'>;

@Injectable({ providedIn: 'root' })
export class DrugService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/drugs`;

  list(): Observable<Drug[]> {
    return this.http.get<Drug[]>(this.baseUrl);
  }

  create(drug: DrugInput): Observable<Drug> {
    return this.http.post<Drug>(this.baseUrl, drug);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
