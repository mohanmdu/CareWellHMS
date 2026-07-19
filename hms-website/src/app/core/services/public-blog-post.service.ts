import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicBlogPost } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicBlogPostService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/public/cms/blog-posts`;

  list(): Observable<PublicBlogPost[]> {
    return this.http.get<PublicBlogPost[]>(this.baseUrl);
  }

  getBySlug(slug: string): Observable<PublicBlogPost> {
    return this.http.get<PublicBlogPost>(`${this.baseUrl}/${slug}`);
  }
}
