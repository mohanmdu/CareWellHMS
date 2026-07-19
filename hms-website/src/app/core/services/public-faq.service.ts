import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicFaq } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicFaqService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicFaq[]> {
    return this.http.get<PublicFaq[]>(`${environment.apiBaseUrl}/public/cms/faqs`);
  }
}
