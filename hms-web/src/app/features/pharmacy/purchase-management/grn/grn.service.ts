import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Grn, GrnListEntry, GrnRequest, GrnStatus } from './grn.model';

@Injectable({ providedIn: 'root' })
export class GrnService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/grns`;

  list(status?: GrnStatus): Observable<GrnListEntry[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<GrnListEntry[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<Grn> {
    return this.http.get<Grn>(`${this.baseUrl}/${id}`);
  }

  create(request: GrnRequest): Observable<Grn> {
    return this.http.post<Grn>(this.baseUrl, request);
  }

  update(id: number, request: GrnRequest): Observable<Grn> {
    return this.http.put<Grn>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
