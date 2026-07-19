import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientDiagnosis, PatientDiagnosisInput } from './icd.model';

/** Client for hms-api's PatientDiagnosisController (Assigned ICD Codes). */
@Injectable({ providedIn: 'root' })
export class PatientDiagnosisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/icd`;

  findByPatient(patientId: number): Observable<PatientDiagnosis[]> {
    return this.http.get<PatientDiagnosis[]>(`${this.baseUrl}/patients/${patientId}/diagnoses`);
  }

  create(patientId: number, input: PatientDiagnosisInput): Observable<PatientDiagnosis> {
    return this.http.post<PatientDiagnosis>(`${this.baseUrl}/patients/${patientId}/diagnoses`, input);
  }

  update(id: number, input: PatientDiagnosisInput): Observable<PatientDiagnosis> {
    return this.http.put<PatientDiagnosis>(`${this.baseUrl}/diagnoses/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/diagnoses/${id}`);
  }
}
