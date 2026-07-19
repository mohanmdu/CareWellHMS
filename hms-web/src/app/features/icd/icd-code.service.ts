import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IcdCode, IcdCodeImportResult, IcdCodeInput, IcdVersion } from './icd.model';

/** Client for hms-api's IcdCodeController (the ICD Code Master). */
@Injectable({ providedIn: 'root' })
export class IcdCodeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/icd/codes`;

  list(): Observable<IcdCode[]> {
    return this.http.get<IcdCode[]>(this.baseUrl);
  }

  listInactive(): Observable<IcdCode[]> {
    return this.http.get<IcdCode[]>(`${this.baseUrl}/inactive`);
  }

  search(query: string, version?: IcdVersion | null): Observable<IcdCode[]> {
    let params = new HttpParams().set('q', query);
    if (version) {
      params = params.set('version', version);
    }
    return this.http.get<IcdCode[]>(`${this.baseUrl}/search`, { params });
  }

  create(input: IcdCodeInput): Observable<IcdCode> {
    return this.http.post<IcdCode>(this.baseUrl, input);
  }

  update(id: number, input: IcdCodeInput): Observable<IcdCode> {
    return this.http.put<IcdCode>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  importCsv(file: File): Observable<IcdCodeImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IcdCodeImportResult>(`${this.baseUrl}/import`, formData);
  }
}
