import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicCareerOpening } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicCareerOpeningService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicCareerOpening[]> {
    return this.http.get<PublicCareerOpening[]>(`${environment.apiBaseUrl}/public/cms/career-openings`);
  }
}
