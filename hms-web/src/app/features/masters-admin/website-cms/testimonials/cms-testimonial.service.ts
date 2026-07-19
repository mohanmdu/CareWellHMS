import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsTestimonial, CmsTestimonialInput } from './cms-testimonial.model';

@Injectable({ providedIn: 'root' })
export class CmsTestimonialService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/testimonials`;

  list(): Observable<CmsTestimonial[]> {
    return this.http.get<CmsTestimonial[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsTestimonial[]> {
    return this.http.get<CmsTestimonial[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsTestimonialInput): Observable<CmsTestimonial> {
    return this.http.post<CmsTestimonial>(this.baseUrl, input);
  }

  update(id: number, input: CmsTestimonialInput): Observable<CmsTestimonial> {
    return this.http.put<CmsTestimonial>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  uploadImage(id: number, file: File): Observable<CmsTestimonial> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CmsTestimonial>(`${this.baseUrl}/${id}/image`, formData);
  }
}
