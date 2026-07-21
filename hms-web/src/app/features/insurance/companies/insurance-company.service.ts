import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InsuranceCompany, InsuranceCompanyInput } from './insurance-company.model';

@Injectable({ providedIn: 'root' })
export class InsuranceCompanyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/insurance/companies`;

  list(): Observable<InsuranceCompany[]> {
    return this.http.get<InsuranceCompany[]>(this.baseUrl);
  }

  listInactive(): Observable<InsuranceCompany[]> {
    return this.http.get<InsuranceCompany[]>(`${this.baseUrl}/inactive`);
  }

  create(company: InsuranceCompanyInput): Observable<InsuranceCompany> {
    return this.http.post<InsuranceCompany>(this.baseUrl, company);
  }

  update(id: number, company: InsuranceCompanyInput): Observable<InsuranceCompany> {
    return this.http.put<InsuranceCompany>(`${this.baseUrl}/${id}`, company);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
