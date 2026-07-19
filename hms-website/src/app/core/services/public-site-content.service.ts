import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicSiteContent } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicSiteContentService {
  private readonly http = inject(HttpClient);

  get(): Observable<PublicSiteContent> {
    return this.http.get<PublicSiteContent>(`${environment.apiBaseUrl}/public/cms/site-content`);
  }
}
