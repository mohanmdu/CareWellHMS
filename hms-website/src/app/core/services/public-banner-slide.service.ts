import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicBannerSlide } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicBannerSlideService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicBannerSlide[]> {
    return this.http.get<PublicBannerSlide[]>(`${environment.apiBaseUrl}/public/cms/banner-slides`);
  }
}
