import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Patient } from './patient.model';

export type PatientInput = Omit<Patient, 'id' | 'registrationNumber'>;

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/registration/patients`;

  search(query: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.baseUrl, { params: query ? { query } : {} });
  }

  register(patient: PatientInput): Observable<Patient> {
    return this.http.post<Patient>(this.baseUrl, patient);
  }
}
