import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Admission } from './admission.model';

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ip/admissions`;

  list(): Observable<Admission[]> {
    return this.http.get<Admission[]>(this.baseUrl);
  }

  admit(patientId: number, roomId: number): Observable<Admission> {
    return this.http.post<Admission>(this.baseUrl, { patientId, roomId });
  }

  addAdvancePayment(id: number, amount: number): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/advance-payment`, { amount });
  }

  discharge(id: number, totalBilled: number, dischargeSummary: string): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/discharge`, { totalBilled, dischargeSummary });
  }
}
