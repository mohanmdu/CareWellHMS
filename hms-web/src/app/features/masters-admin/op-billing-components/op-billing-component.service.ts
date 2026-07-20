import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OpBillingComponent } from './op-billing-component.model';

export type OpBillingComponentInput = Pick<OpBillingComponent, 'categoryId' | 'name' | 'amount'>;

@Injectable({ providedIn: 'root' })
export class OpBillingComponentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/masters/op-billing-components`;

  list(): Observable<OpBillingComponent[]> {
    return this.http.get<OpBillingComponent[]>(this.baseUrl);
  }

  search(query: string, categoryId: number | null): Observable<OpBillingComponent[]> {
    let params = new HttpParams().set('q', query);
    if (categoryId !== null) {
      params = params.set('categoryId', categoryId);
    }
    return this.http.get<OpBillingComponent[]>(`${this.baseUrl}/search`, { params });
  }

  listInactive(): Observable<OpBillingComponent[]> {
    return this.http.get<OpBillingComponent[]>(`${this.baseUrl}/inactive`);
  }

  create(input: OpBillingComponentInput): Observable<OpBillingComponent> {
    return this.http.post<OpBillingComponent>(this.baseUrl, input);
  }

  update(id: number, input: OpBillingComponentInput): Observable<OpBillingComponent> {
    return this.http.put<OpBillingComponent>(`${this.baseUrl}/${id}`, input);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
