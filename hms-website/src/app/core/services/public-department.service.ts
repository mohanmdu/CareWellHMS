import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicDepartment } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicDepartmentService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicDepartment[]> {
    return this.http.get<PublicDepartment[]>(`${environment.apiBaseUrl}/public/departments`);
  }
}
