import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { RoomType } from './room-type.model';
import { Room } from './room.model';
import { RoomService, RoomTypeService } from './room.service';

/**
 * Neither room types nor rooms expose a deactivate endpoint (RoomTypeService/
 * RoomService only have list/create), so this stays hand-built rather than
 * driven by shared/master-crud - occupancy is a derived, read-only status.
 */
@Component({
  selector: 'app-room-catalog',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './room-catalog.component.html',
  styleUrl: './room-catalog.component.scss'
})
export class RoomCatalogComponent {
  private readonly roomTypeService = inject(RoomTypeService);
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);

  readonly roomTypeColumns = ['name', 'dailyRate'];
  readonly roomColumns = ['roomNumber', 'roomType', 'status'];

  roomTypes = signal<RoomType[]>([]);
  rooms = signal<Room[]>([]);
  loadingRoomTypes = signal(false);
  loadingRooms = signal(false);
  savingRoomType = signal(false);
  savingRoom = signal(false);

  newRoomType = { name: '', dailyRate: 0 };
  newRoom = { roomNumber: '', roomTypeId: null as number | null };

  constructor() {
    this.refreshRoomTypes();
    this.refreshRooms();
  }

  refreshRoomTypes(): void {
    this.loadingRoomTypes.set(true);
    this.roomTypeService.list().subscribe({
      next: (types) => {
        this.roomTypes.set(types);
        this.loadingRoomTypes.set(false);
      },
      error: () => {
        this.loadingRoomTypes.set(false);
        this.notification.error('Failed to load room types.');
      }
    });
  }

  refreshRooms(): void {
    this.loadingRooms.set(true);
    this.roomService.list().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loadingRooms.set(false);
      },
      error: () => {
        this.loadingRooms.set(false);
        this.notification.error('Failed to load rooms.');
      }
    });
  }

  addRoomType(): void {
    if (!this.newRoomType.name.trim()) {
      return;
    }
    this.savingRoomType.set(true);
    this.roomTypeService.create({ ...this.newRoomType }).subscribe({
      next: () => {
        this.savingRoomType.set(false);
        this.newRoomType = { name: '', dailyRate: 0 };
        this.notification.success('Room type added.');
        this.refreshRoomTypes();
      },
      error: (err) => {
        this.savingRoomType.set(false);
        this.notification.error(err.error?.message ?? 'Failed to create room type.');
      }
    });
  }

  addRoom(): void {
    if (!this.newRoom.roomNumber.trim() || !this.newRoom.roomTypeId) {
      return;
    }
    this.savingRoom.set(true);
    this.roomService
      .create({ roomNumber: this.newRoom.roomNumber.trim(), roomTypeId: this.newRoom.roomTypeId })
      .subscribe({
        next: () => {
          this.savingRoom.set(false);
          this.newRoom = { roomNumber: '', roomTypeId: null };
          this.notification.success('Room added.');
          this.refreshRooms();
        },
        error: (err) => {
          this.savingRoom.set(false);
          this.notification.error(err.error?.message ?? 'Failed to create room.');
        }
      });
  }
}
