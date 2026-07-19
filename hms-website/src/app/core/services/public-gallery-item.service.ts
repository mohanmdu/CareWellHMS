import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryItemType, PublicGalleryItem } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicGalleryItemService {
  private readonly http = inject(HttpClient);

  list(type?: GalleryItemType): Observable<PublicGalleryItem[]> {
    const params = type ? new HttpParams().set('type', type) : undefined;
    return this.http.get<PublicGalleryItem[]>(`${environment.apiBaseUrl}/public/cms/gallery-items`, { params });
  }
}
