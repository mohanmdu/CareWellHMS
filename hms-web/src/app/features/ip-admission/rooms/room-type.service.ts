import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RoomType, RoomTypeInput } from './room-type.model';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ip/room-types`;

  list(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.baseUrl);
  }

  listInactive(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.baseUrl}/inactive`);
  }

  create(roomType: RoomTypeInput): Observable<RoomType> {
    return this.http.post<RoomType>(this.baseUrl, roomType);
  }

  update(id: number, roomType: RoomTypeInput): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.baseUrl}/${id}`, roomType);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
