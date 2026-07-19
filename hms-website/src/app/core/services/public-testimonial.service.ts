import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicTestimonial } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicTestimonialService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicTestimonial[]> {
    return this.http.get<PublicTestimonial[]>(`${environment.apiBaseUrl}/public/cms/testimonials`);
  }
}
