import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabComponent, LabComponentInput } from './lab.model';

@Injectable({ providedIn: 'root' })
export class LabComponentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/components`;

  list(): Observable<LabComponent[]> {
    return this.http.get<LabComponent[]>(this.baseUrl);
  }

  create(input: LabComponentInput): Observable<LabComponent> {
    return this.http.post<LabComponent>(this.baseUrl, input);
  }

  update(id: number, input: LabComponentInput): Observable<LabComponent> {
    return this.http.put<LabComponent>(`${this.baseUrl}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
