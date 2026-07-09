import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Department } from './department.model';

/**
 * Client for hms-api's DepartmentController - the REST replacement for the
 * legacy getDepartments / addDepartment / deptEdit / updateDept /
 * deptDeactivate Struts actions (migration doc §4.6, §5).
 */
@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/departments`;

  list(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseUrl);
  }

  create(department: Pick<Department, 'name'>): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, { name: department.name, active: true });
  }

  update(id: number, department: Pick<Department, 'name'>): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/${id}`, { name: department.name, active: true });
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
