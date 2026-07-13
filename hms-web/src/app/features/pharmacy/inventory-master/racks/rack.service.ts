import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Rack } from './rack.model';

@Injectable({ providedIn: 'root' })
export class RackService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy/racks`;

  list(): Observable<Rack[]> {
    return this.http.get<Rack[]>(this.baseUrl);
  }

  listInactive(): Observable<Rack[]> {
    return this.http.get<Rack[]>(`${this.baseUrl}/inactive`);
  }

  create(name: string): Observable<Rack> {
    return this.http.post<Rack>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<Rack> {
    return this.http.put<Rack>(`${this.baseUrl}/${id}`, { name });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
