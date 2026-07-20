import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabSubCategory, LabSubCategoryInput } from './lab.model';

@Injectable({ providedIn: 'root' })
export class LabSubCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/sub-categories`;

  list(): Observable<LabSubCategory[]> {
    return this.http.get<LabSubCategory[]>(this.baseUrl);
  }

  search(query: string, categoryId?: number | null): Observable<LabSubCategory[]> {
    let params = new HttpParams().set('q', query);
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    return this.http.get<LabSubCategory[]>(`${this.baseUrl}/search`, { params });
  }

  create(input: LabSubCategoryInput): Observable<LabSubCategory> {
    return this.http.post<LabSubCategory>(this.baseUrl, input);
  }

  update(id: number, input: LabSubCategoryInput): Observable<LabSubCategory> {
    return this.http.put<LabSubCategory>(`${this.baseUrl}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
