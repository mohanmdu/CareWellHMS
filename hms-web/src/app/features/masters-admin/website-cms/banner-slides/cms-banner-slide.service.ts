import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsBannerSlide, CmsBannerSlideInput } from './cms-banner-slide.model';

@Injectable({ providedIn: 'root' })
export class CmsBannerSlideService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/banner-slides`;

  list(): Observable<CmsBannerSlide[]> {
    return this.http.get<CmsBannerSlide[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsBannerSlide[]> {
    return this.http.get<CmsBannerSlide[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsBannerSlideInput): Observable<CmsBannerSlide> {
    return this.http.post<CmsBannerSlide>(this.baseUrl, input);
  }

  update(id: number, input: CmsBannerSlideInput): Observable<CmsBannerSlide> {
    return this.http.put<CmsBannerSlide>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  uploadImage(id: number, file: File): Observable<CmsBannerSlide> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CmsBannerSlide>(`${this.baseUrl}/${id}/image`, formData);
  }
}
