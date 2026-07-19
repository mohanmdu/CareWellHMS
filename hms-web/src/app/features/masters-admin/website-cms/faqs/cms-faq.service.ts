import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CmsFaq, CmsFaqInput } from './cms-faq.model';

@Injectable({ providedIn: 'root' })
export class CmsFaqService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/cms/faqs`;

  list(): Observable<CmsFaq[]> {
    return this.http.get<CmsFaq[]>(this.baseUrl);
  }

  listInactive(): Observable<CmsFaq[]> {
    return this.http.get<CmsFaq[]>(`${this.baseUrl}/inactive`);
  }

  create(input: CmsFaqInput): Observable<CmsFaq> {
    return this.http.post<CmsFaq>(this.baseUrl, input);
  }

  update(id: number, input: CmsFaqInput): Observable<CmsFaq> {
    return this.http.put<CmsFaq>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
