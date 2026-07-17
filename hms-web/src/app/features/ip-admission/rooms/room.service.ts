import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Room, RoomInput, RoomStatus } from './room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ip/rooms`;

  list(): Observable<Room[]> {
    return this.http.get<Room[]>(this.baseUrl);
  }

  listInactive(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/inactive`);
  }

  create(room: RoomInput): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, room);
  }

  update(id: number, room: RoomInput): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/${id}`, room);
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  updateStatus(id: number, status: RoomStatus): Observable<Room> {
    return this.http.patch<Room>(`${this.baseUrl}/${id}/status`, { status });
  }
}
