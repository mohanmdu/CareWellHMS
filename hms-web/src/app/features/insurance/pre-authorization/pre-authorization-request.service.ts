import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface PreAuthorizationApproveInput {
  approvedAmount: number;
  reason: string | null;
  decidedDate: string;
}

export interface PreAuthorizationRejectInput {
  reason: string | null;
  decidedDate: string;
}

export interface PreAuthorizationAmendInput {
  requestedAmount: number;
  approvedAmount: number;
  cardNumber: string | null;
  claimNumber: string | null;
}

export interface PreAuthorizationReportFilters {
  from?: string;
  to?: string;
  insurerName?: string;
  patientUhid?: string;
}

function toParams(filters: PreAuthorizationReportFilters): HttpParams {
  let params = new HttpParams();
  if (filters.from) {
    params = params.set('from', filters.from);
  }
  if (filters.to) {
    params = params.set('to', filters.to);
  }
  if (filters.insurerName) {
    params = params.set('insurerName', filters.insurerName);
  }
  if (filters.patientUhid) {
    params = params.set('patientUhid', filters.patientUhid);
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class PreAuthorizationRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/insurance/pre-authorization-requests`;

  list(): Observable<PreAuthorizationRequest[]> {
    return this.http.get<PreAuthorizationRequest[]>(this.baseUrl);
  }

  getPending(): Observable<PreAuthorizationRequest[]> {
    return this.http.get<PreAuthorizationRequest[]>(`${this.baseUrl}/pending`);
  }

  getApprovedReport(filters: PreAuthorizationReportFilters): Observable<PreAuthorizationRequest[]> {
    return this.http.get<PreAuthorizationRequest[]>(`${this.baseUrl}/approved`, { params: toParams(filters) });
  }

  getRejectedReport(filters: PreAuthorizationReportFilters): Observable<PreAuthorizationRequest[]> {
    return this.http.get<PreAuthorizationRequest[]>(`${this.baseUrl}/rejected`, { params: toParams(filters) });
  }

  create(request: PreAuthorizationRequestInput): Observable<PreAuthorizationRequest> {
    return this.http.post<PreAuthorizationRequest>(this.baseUrl, request);
  }

  raise(id: number, input: PreAuthorizationRaiseInput): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/raise`, input);
  }

  approve(id: number, input: PreAuthorizationApproveInput): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/approve`, input);
  }

  reject(id: number, input: PreAuthorizationRejectInput): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/reject`, input);
  }

  amend(id: number, input: PreAuthorizationAmendInput): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/amend`, input);
  }

  cancel(id: number, reason: string): Observable<PreAuthorizationRequest> {
    return this.http.patch<PreAuthorizationRequest>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
