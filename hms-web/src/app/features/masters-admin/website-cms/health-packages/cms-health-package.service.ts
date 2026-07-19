import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsHealthPackage, CmsHealthPackageInput } from './cms-health-package.model';

@Injectable({ providedIn: 'root' })
export class CmsHealthPackageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/health-packages`;

  list(): Observable<CmsHealthPackage[]> {
    return this.http.get<CmsHealthPackage[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsHealthPackage[]> {
    return this.http.get<CmsHealthPackage[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsHealthPackageInput): Observable<CmsHealthPackage> {
    return this.http.post<CmsHealthPackage>(this.baseUrl, input);
  }

  update(id: number, input: CmsHealthPackageInput): Observable<CmsHealthPackage> {
    return this.http.put<CmsHealthPackage>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
