import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsCareerOpening, CmsCareerOpeningInput } from './cms-career-opening.model';

@Injectable({ providedIn: 'root' })
export class CmsCareerOpeningService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/career-openings`;

  list(): Observable<CmsCareerOpening[]> {
    return this.http.get<CmsCareerOpening[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsCareerOpening[]> {
    return this.http.get<CmsCareerOpening[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsCareerOpeningInput): Observable<CmsCareerOpening> {
    return this.http.post<CmsCareerOpening>(this.baseUrl, input);
  }

  update(id: number, input: CmsCareerOpeningInput): Observable<CmsCareerOpening> {
    return this.http.put<CmsCareerOpening>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
