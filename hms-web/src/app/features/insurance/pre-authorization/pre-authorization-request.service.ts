import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PreAuthorizationRequest } from './pre-authorization-request.model';

export type PreAuthorizationRequestInput = Pick<
  PreAuthorizationRequest,
  'patientId' | 'policyNumber' | 'cardNumber' | 'insurerName' | 'tpaName' | 'corporateName' | 'requestedAmount'
>;

export interface PreAuthorizationRaiseInput {
  policyNumber: string;
  cardNumber: string | null;
  requestedAmount: number;
}

@Injectable({ providedIn: 'root' })
export class PreAuthorizationRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/insurance/pre-authorization-requests`;

  list(): Observable<PreAuthorizationRequest[]> {
    return this.http.get<PreAuthorizationRequest[]>(this.baseUrl);
  }

  create(request: PreAuthorizationRequestInput): Observable<PreAuthorizationRequest> {
    return this.http.post<PreAuthorizationRequest>(this.baseUrl, request);
  }

  raise(id: number, input: PreAuthorizationRaiseInput): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/raise`, input);
  }

  approve(id: number, approvedAmount: number): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/approve`, { approvedAmount });
  }

  reject(id: number, reason: string): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  cancel(id: number, reason: string): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
