import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LabCategoryTestGroup,
  LabRequisition,
  LabRequisitionApproveInput,
  LabRequisitionCreateInput,
  LabRequisitionListRow
} from './lab-requisition.model';

@Injectable({ providedIn: 'root' })
export class LabRequisitionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/requisitions`;

  getTestCatalog(): Observable<LabCategoryTestGroup[]> {
    return this.http.get<LabCategoryTestGroup[]>(`${this.baseUrl}/test-catalog`);
  }

  create(input: LabRequisitionCreateInput): Observable<LabRequisition> {
    return this.http.post<LabRequisition>(this.baseUrl, input);
  }

  getPending(): Observable<LabRequisitionListRow[]> {
    return this.http.get<LabRequisitionListRow[]>(`${this.baseUrl}/pending`);
  }

  getById(id: number): Observable<LabRequisition> {
    return this.http.get<LabRequisition>(`${this.baseUrl}/${id}`);
  }

  approve(id: number, input: LabRequisitionApproveInput): Observable<LabRequisition> {
    return this.http.patch<LabRequisition>(`${this.baseUrl}/${id}/approve`, input);
  }

  cancel(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
