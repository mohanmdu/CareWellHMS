import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsGalleryItem, CmsGalleryItemInput } from './cms-gallery-item.model';

@Injectable({ providedIn: 'root' })
export class CmsGalleryItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/gallery-items`;

  list(): Observable<CmsGalleryItem[]> {
    return this.http.get<CmsGalleryItem[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsGalleryItem[]> {
    return this.http.get<CmsGalleryItem[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsGalleryItemInput): Observable<CmsGalleryItem> {
    return this.http.post<CmsGalleryItem>(this.baseUrl, input);
  }

  update(id: number, input: CmsGalleryItemInput): Observable<CmsGalleryItem> {
    return this.http.put<CmsGalleryItem>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  uploadImage(id: number, file: File): Observable<CmsGalleryItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CmsGalleryItem>(`${this.baseUrl}/${id}/image`, formData);
  }
}
