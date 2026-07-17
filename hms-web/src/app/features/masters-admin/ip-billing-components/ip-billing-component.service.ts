import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IpBillingComponent } from './ip-billing-component.model';

export type IpBillingComponentInput = Pick<IpBillingComponent, 'categoryId' | 'name' | 'ipAmount' | 'insuranceAmount'>;

@Injectable({ providedIn: 'root' })
export class IpBillingComponentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/ip-billing-components`;

  list(): Observable<IpBillingComponent[]> {
    return this.http.get<IpBillingComponent[]>(this.baseUrl);
  }

  listInactive(): Observable<IpBillingComponent[]> {
    return this.http.get<IpBillingComponent[]>(`${this.baseUrl}/inactive`);
  }

  create(input: IpBillingComponentInput): Observable<IpBillingComponent> {
    return this.http.post<IpBillingComponent>(this.baseUrl, input);
  }

  update(id: number, input: IpBillingComponentInput): Observable<IpBillingComponent> {
    return this.http.put<IpBillingComponent>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
