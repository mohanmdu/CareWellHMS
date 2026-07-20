import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LabApprovedListRow,
  LabTestEntry,
  LabTestEntryListRow,
  LabTestEntrySaveInput
} from './lab-test-entry.model';

@Injectable({ providedIn: 'root' })
export class LabTestEntryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/test-entries`;

  getQueue(statuses: string[]): Observable<LabTestEntryListRow[]> {
    return this.http.get<LabTestEntryListRow[]>(this.baseUrl, {
      params: new HttpParams().set('statuses', statuses.join(','))
    });
  }

  getApproved(): Observable<LabApprovedListRow[]> {
    return this.http.get<LabApprovedListRow[]>(`${this.baseUrl}/approved`);
  }

  getById(id: number): Observable<LabTestEntry> {
    return this.http.get<LabTestEntry>(`${this.baseUrl}/${id}`);
  }

  save(id: number, input: LabTestEntrySaveInput): Observable<LabTestEntry> {
    return this.http.put<LabTestEntry>(`${this.baseUrl}/${id}`, input);
  }

  saveDraft(id: number, input: LabTestEntrySaveInput): Observable<LabTestEntry> {
    return this.http.put<LabTestEntry>(`${this.baseUrl}/${id}/draft`, input);
  }

  approve(id: number, input: LabTestEntrySaveInput): Observable<LabTestEntry> {
    return this.http.patch<LabTestEntry>(`${this.baseUrl}/${id}/approve`, input);
  }
}
