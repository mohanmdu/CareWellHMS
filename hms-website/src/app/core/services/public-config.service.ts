import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicConfig } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicConfigService {
  private readonly http = inject(HttpClient);

  get(): Observable<PublicConfig> {
    return this.http.get<PublicConfig>(`${environment.apiBaseUrl}/public/config`);
  }
}
