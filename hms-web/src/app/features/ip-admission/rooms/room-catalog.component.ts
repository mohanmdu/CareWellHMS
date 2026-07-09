import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomType } from './room-type.model';
import { Room } from './room.model';
import { RoomService, RoomTypeService } from './room.service';

@Component({
  selector: 'app-room-catalog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './room-catalog.component.html'
})
export class RoomCatalogComponent {
  private readonly roomTypeService = inject(RoomTypeService);
  private readonly roomService = inject(RoomService);

  roomTypes = signal<RoomType[]>([]);
  rooms = signal<Room[]>([]);
  errorMessage = signal<string | null>(null);

  newRoomType = { name: '', dailyRate: 0 };
  newRoom = { roomNumber: '', roomTypeId: null as number | null };

  constructor() {
    this.refreshRoomTypes();
    this.refreshRooms();
  }

  refreshRoomTypes(): void {
    this.roomTypeService.list().subscribe({
      next: (types) => this.roomTypes.set(types),
      error: () => this.errorMessage.set('Failed to load room types.')
    });
  }

  refreshRooms(): void {
    this.roomService.list().subscribe({
      next: (rooms) => this.rooms.set(rooms),
      error: () => this.errorMessage.set('Failed to load rooms.')
    });
  }

  addRoomType(): void {
    if (!this.newRoomType.name.trim()) return;
    this.roomTypeService.create({ ...this.newRoomType }).subscribe({
      next: () => {
        this.newRoomType = { name: '', dailyRate: 0 };
        this.refreshRoomTypes();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create room type.')
    });
  }

  addRoom(): void {
    if (!this.newRoom.roomNumber.trim() || !this.newRoom.roomTypeId) return;
    this.roomService.create({ roomNumber: this.newRoom.roomNumber.trim(), roomTypeId: this.newRoom.roomTypeId }).subscribe({
      next: () => {
        this.newRoom = { roomNumber: '', roomTypeId: null };
        this.refreshRooms();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create room.')
    });
  }
}
