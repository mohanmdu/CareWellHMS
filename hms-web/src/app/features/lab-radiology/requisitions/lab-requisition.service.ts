import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LabRequisition } from './lab-requisition.model';

export interface LabRequisitionCreateRequest {
  patientId: number;
  appointmentId: number | null;
  notes: string;
  items: { billingItemId: number; specimenType: string }[];
}

@Injectable({ providedIn: 'root' })
export class LabRequisitionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/requisitions`;

  list(): Observable<LabRequisition[]> {
    return this.http.get<LabRequisition[]>(this.baseUrl);
  }

  create(request: LabRequisitionCreateRequest): Observable<LabRequisition> {
    return this.http.post<LabRequisition>(this.baseUrl, request);
  }

  collectSpecimen(requisitionId: number, itemId: number): Observable<LabRequisition> {
    return this.http.patch<LabRequisition>(`${this.baseUrl}/${requisitionId}/items/${itemId}/collect-specimen`, {});
  }

  enterResult(requisitionId: number, itemId: number, resultValue: string, normalRange: string): Observable<LabRequisition> {
    return this.http.patch<LabRequisition>(`${this.baseUrl}/${requisitionId}/items/${itemId}/enter-result`, {
      resultValue,
      normalRange
    });
  }

  approve(requisitionId: number, itemId: number): Observable<LabRequisition> {
    return this.http.patch<LabRequisition>(`${this.baseUrl}/${requisitionId}/items/${itemId}/approve`, {});
  }
}
