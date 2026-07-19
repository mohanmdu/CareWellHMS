import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsBlogPost, CmsBlogPostInput } from './cms-blog-post.model';

@Injectable({ providedIn: 'root' })
export class CmsBlogPostService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/blog-posts`;

  list(): Observable<CmsBlogPost[]> {
    return this.http.get<CmsBlogPost[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsBlogPost[]> {
    return this.http.get<CmsBlogPost[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsBlogPostInput): Observable<CmsBlogPost> {
    return this.http.post<CmsBlogPost>(this.baseUrl, input);
  }

  update(id: number, input: CmsBlogPostInput): Observable<CmsBlogPost> {
    return this.http.put<CmsBlogPost>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  uploadImage(id: number, file: File): Observable<CmsBlogPost> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CmsBlogPost>(`${this.baseUrl}/${id}/image`, formData);
  }
}
