import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RoomType } from './room-type.model';
import { Room } from './room.model';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ip/room-types`;

  list(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.baseUrl);
  }

  create(roomType: Pick<RoomType, 'name' | 'dailyRate'>): Observable<RoomType> {
    return this.http.post<RoomType>(this.baseUrl, roomType);
  }
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ip/rooms`;

  list(): Observable<Room[]> {
    return this.http.get<Room[]>(this.baseUrl);
  }

  create(room: Pick<Room, 'roomNumber' | 'roomTypeId'>): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, room);
  }
}
