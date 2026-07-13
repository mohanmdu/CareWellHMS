import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Specialization } from './specialization.model';

@Injectable({ providedIn: 'root' })
export class SpecializationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/specializations`;

  list(): Observable<Specialization[]> {
    return this.http.get<Specialization[]>(this.baseUrl);
  }

  create(specialization: Pick<Specialization, 'name'>): Observable<Specialization> {
    return this.http.post<Specialization>(this.baseUrl, { name: specialization.name });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
