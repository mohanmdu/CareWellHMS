import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicHealthPackage } from '../models/public.model';

@Injectable({ providedIn: 'root' })
export class PublicHealthPackageService {
  private readonly http = inject(HttpClient);

  list(): Observable<PublicHealthPackage[]> {
    return this.http.get<PublicHealthPackage[]>(`${environment.apiBaseUrl}/public/cms/health-packages`);
  }
}
