import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicNewsEvent } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicNewsEventService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicNewsEvent[]> {
    return this.http.get<PublicNewsEvent[]>(`${environment.apiBaseUrl}/public/cms/news-events`);
  }
}
