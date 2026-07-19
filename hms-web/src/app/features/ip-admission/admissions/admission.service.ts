import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Admission, AdmissionAdmitInput, AdmissionRegistrationInput } from './admission.model';

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ip/admissions`;

  list(): Observable<Admission[]> {
    return this.http.get<Admission[]>(this.baseUrl);
  }

  get(id: number): Observable<Admission> {
    return this.http.get<Admission>(`${this.baseUrl}/${id}`);
  }

  admit(patientId: number, roomId: number): Observable<Admission> {
    return this.http.post<Admission>(this.baseUrl, { patientId, roomId });
  }

  admitRegistered(id: number, input: AdmissionAdmitInput): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/admit`, input);
  }

  changeRoom(id: number, roomId: number, changedAt: string): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/change-room`, { roomId, changedAt });
  }

  register(input: AdmissionRegistrationInput): Observable<Admission> {
    return this.http.post<Admission>(`${this.baseUrl}/register`, input);
  }

  uploadPhoto(id: number, file: File): Observable<Admission> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Admission>(`${this.baseUrl}/${id}/photo`, formData);
  }

  addAdvancePayment(id: number, amount: number): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/advance-payment`, { amount });
  }

  initiateDischarge(id: number, dischargeDate: string, dischargeType: string): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/initiate-discharge`, { dischargeDate, dischargeType });
  }

  finalizeDischarge(id: number, totalBilled: number, dischargeSummary: string | null): Observable<Admission> {
    return this.http.patch<Admission>(`${this.baseUrl}/${id}/finalize-discharge`, { totalBilled, dischargeSummary });
  }
}
