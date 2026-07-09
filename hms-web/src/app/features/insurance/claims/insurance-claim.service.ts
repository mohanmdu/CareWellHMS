import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InsuranceClaim } from './insurance-claim.model';

export type InsuranceClaimInput = Pick<
  InsuranceClaim,
  'patientId' | 'policyNumber' | 'insurerName' | 'claimType' | 'requestedAmount'
>;

@Injectable({ providedIn: 'root' })
export class InsuranceClaimService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/insurance/claims`;

  list(): Observable<InsuranceClaim[]> {
    return this.http.get<InsuranceClaim[]>(this.baseUrl);
  }

  create(claim: InsuranceClaimInput): Observable<InsuranceClaim> {
    return this.http.post<InsuranceClaim>(this.baseUrl, claim);
  }

  approve(id: number, approvedAmount: number): Observable<InsuranceClaim> {
    return this.http.patch<InsuranceClaim>(`${this.baseUrl}/${id}/approve`, { approvedAmount });
  }

  reject(id: number, reason: string): Observable<InsuranceClaim> {
    return this.http.patch<InsuranceClaim>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  cancel(id: number, reason: string): Observable<InsuranceClaim> {
    return this.http.patch<InsuranceClaim>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
