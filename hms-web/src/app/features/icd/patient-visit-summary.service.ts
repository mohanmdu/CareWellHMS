import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientVisitSummary } from './icd.model';

/** Client for hms-api's PatientVisitSummaryController - the ICD Code Search result table. */
@Injectable({ providedIn: 'root' })
export class PatientVisitSummaryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/icd/patients`;

  search(query: string): Observable<PatientVisitSummary[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    return this.http.get<PatientVisitSummary[]>(`${this.baseUrl}/search`, { params });
  }
}
