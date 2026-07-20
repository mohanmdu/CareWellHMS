import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabCategory, LabCategoryInput } from './lab.model';

@Injectable({ providedIn: 'root' })
export class LabCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lab/categories`;

  list(): Observable<LabCategory[]> {
    return this.http.get<LabCategory[]>(this.baseUrl);
  }

  search(query: string): Observable<LabCategory[]> {
    return this.http.get<LabCategory[]>(`${this.baseUrl}/search`, { params: new HttpParams().set('q', query) });
  }

  create(input: LabCategoryInput): Observable<LabCategory> {
    return this.http.post<LabCategory>(this.baseUrl, input);
  }

  update(id: number, input: LabCategoryInput): Observable<LabCategory> {
    return this.http.put<LabCategory>(`${this.baseUrl}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
