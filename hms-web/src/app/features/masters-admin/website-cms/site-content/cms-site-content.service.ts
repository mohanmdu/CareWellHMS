import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsSiteContent } from './cms-site-content.model';

@Injectable({ providedIn: 'root' })
export class CmsSiteContentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/site-content`;

  get(): Observable<CmsSiteContent> {
    return this.http.get<CmsSiteContent>(this.baseUrl);
  }

  update(content: CmsSiteContent): Observable<CmsSiteContent> {
    return this.http.put<CmsSiteContent>(this.baseUrl, content);
  }
}
