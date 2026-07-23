import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { RoomType } from './room-type.model';
import { RoomTypeService } from './room-type.service';
import { Room, RoomInput } from './room.model';
import { RoomService } from './room.service';

const EMPTY_FORM: RoomInput = { roomNumber: '', bedNumber: null, roomTypeId: 0 };

/** One Room Number, with every bed row filed under it (usually just one). */
interface RoomGroup {
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string | null;
  rentCash: number | null;
  createdBy: string | null;
  beds: Room[];
}

/** Rooms sharing a Room Number (multiple beds in one physical room, e.g. a General ward) become one group. */
function groupByRoomNumber(rooms: Room[]): RoomGroup[] {
  const byRoomNumber = new Map<string, Room[]>();
  for (const room of rooms) {
    const beds = byRoomNumber.get(room.roomNumber) ?? [];
    beds.push(room);
    byRoomNumber.set(room.roomNumber, beds);
  }
  return [...byRoomNumber.entries()]
    .map(([roomNumber, beds]) => {
      const sortedBeds = [...beds].sort((a, b) => (a.bedNumber ?? '').localeCompare(b.bedNumber ?? ''));
      const first = sortedBeds[0];
      return {
        roomNumber,
        roomTypeId: first.roomTypeId,
        roomTypeName: first.roomTypeName,
        rentCash: first.rentCash,
        createdBy: first.createdBy,
        beds: sortedBeds
      };
    })
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
}

/**
 * Room Numbers master: inline Room Type/Room Number/Bed Number Add/Update/
 * Clear form, plus separate Active/Deactivated tables below. Rooms sharing a
 * Room Number (multiple beds in one physical room) collapse into a single
 * accordion row that expands to list each bed - a single-bed room (the
 * common case) just shows as a plain row, unchanged from before Bed Number
 * existed. Room Availability status is managed on its own screen.
 */
@Component({
  selector: 'app-room-number-list',
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
    EmptyStateComponent
  ],
  templateUrl: './room-number-list.component.html',
  styleUrl: './room-number-list.component.scss'
})
export class RoomNumberListComponent {
  private readonly service = inject(RoomService);
  private readonly roomTypeService = inject(RoomTypeService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly promptDialog = inject(PromptDialogService);

  readonly activeColumns = ['expand', 'roomType', 'rentCash', 'roomNumber', 'bedNumber', 'createdBy', 'actions'];
  readonly inactiveColumns = ['expand', 'roomType', 'rentCash', 'roomNumber', 'bedNumber', 'deactivatedBy', 'actions'];

  roomTypes = signal<RoomType[]>([]);
  activeRooms = signal<Room[]>([]);
  inactiveRooms = signal<Room[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  readonly activeGroups = computed(() => groupByRoomNumber(this.activeRooms()));
  readonly inactiveGroups = computed(() => groupByRoomNumber(this.inactiveRooms()));

  /** Room Number of the currently expanded accordion row, if any - only ever set for multi-bed groups. */
  expandedRoomNumber = signal<string | null>(null);

  editingId = signal<number | null>(null);
  form: RoomInput = { ...EMPTY_FORM };

  constructor() {
    this.roomTypeService.list().subscribe({
      next: (types) => this.roomTypes.set(types),
      error: () => this.notification.error('Failed to load room types.')
    });
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (rooms) => {
        this.activeRooms.set(rooms);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load rooms.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (rooms) => {
        this.inactiveRooms.set(rooms);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated rooms.');
      }
    });
  }

  toggleExpand(group: RoomGroup): void {
    if (group.beds.length <= 1) {
      return;
    }
    this.expandedRoomNumber.set(this.expandedRoomNumber() === group.roomNumber ? null : group.roomNumber);
  }

  edit(room: Room): void {
    if (room.id === null) {
      return;
    }
    this.editingId.set(room.id);
    this.form = { roomNumber: room.roomNumber, bedNumber: room.bedNumber, roomTypeId: room.roomTypeId };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.roomNumber.trim() || !this.form.roomTypeId) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Room updated.' : 'Room added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save room.');
      }
    });
  }

  /** Adds one more bed under an already-expanded Room Number, without retyping its Room Type/Room Number. */
  addBedToGroup(group: RoomGroup): void {
    this.promptDialog
      .prompt({
        title: `Add bed to room ${group.roomNumber}`,
        fields: [{ key: 'bedNumber', label: 'Bed number', type: 'text', required: true }]
      })
      .subscribe((values) => {
        if (!values) {
          return;
        }
        this.saving.set(true);
        this.service.create({ roomNumber: group.roomNumber, bedNumber: values['bedNumber'] as string, roomTypeId: group.roomTypeId }).subscribe({
          next: () => {
            this.saving.set(false);
            this.notification.success('Bed added.');
            this.refreshActive();
          },
          error: (err) => {
            this.saving.set(false);
            this.notification.error(err.error?.message ?? 'Failed to add bed.');
          }
        });
      });
  }

  deactivate(room: Room): void {
    if (room.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate room ${room.roomNumber}?`,
        message: 'This room will no longer be available for admission. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || room.id === null) {
          return;
        }
        this.service.deactivate(room.id).subscribe({
          next: () => {
            this.notification.success('Room deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate room.')
        });
      });
  }

  restore(room: Room): void {
    if (room.id === null) {
      return;
    }
    this.service.restore(room.id).subscribe({
      next: () => {
        this.notification.success('Room restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore room.')
    });
  }
}
