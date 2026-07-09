import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role } from './role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/roles`;

  list(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  create(role: Pick<Role, 'name'>): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, { name: role.name });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
