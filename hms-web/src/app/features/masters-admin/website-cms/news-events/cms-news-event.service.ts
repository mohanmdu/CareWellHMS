import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsNewsEvent, CmsNewsEventInput } from './cms-news-event.model';

@Injectable({ providedIn: 'root' })
export class CmsNewsEventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/news-events`;

  list(): Observable<CmsNewsEvent[]> {
    return this.http.get<CmsNewsEvent[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsNewsEvent[]> {
    return this.http.get<CmsNewsEvent[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsNewsEventInput): Observable<CmsNewsEvent> {
    return this.http.post<CmsNewsEvent>(this.baseUrl, input);
  }

  update(id: number, input: CmsNewsEventInput): Observable<CmsNewsEvent> {
    return this.http.put<CmsNewsEvent>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  uploadImage(id: number, file: File): Observable<CmsNewsEvent> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CmsNewsEvent>(`${this.baseUrl}/${id}/image`, formData);
  }
}
