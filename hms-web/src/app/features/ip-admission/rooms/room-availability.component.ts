import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { Room, RoomStatus } from './room.model';
import { RoomService } from './room.service';

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  MAINTENANCE: 'Maintenance'
};

type StatusFilter = RoomStatus | 'ALL';

/**
 * Room Availability: live stats + a per-room status dropdown (Available /
 * Allocated / Maintenance). Every status change (confirmed or cancelled)
 * triggers a full refetch, which forces the table to recreate each row's
 * mat-select from fresh data - the simplest reliable way to keep the
 * dropdown in sync with the real status after a cancelled change.
 */
@Component({
  selector: 'app-room-availability',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatTableModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './room-availability.component.html',
  styleUrl: './room-availability.component.scss'
})
export class RoomAvailabilityComponent {
  private readonly service = inject(RoomService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly displayedColumns = ['serialNo', 'roomType', 'roomNumber', 'currentStatus', 'availability'];
  readonly statusLabel = STATUS_LABEL;
  readonly statusOptions: RoomStatus[] = ['AVAILABLE', 'MAINTENANCE', 'ALLOCATED'];
  readonly pageSizeOptions = [10, 20, 50, 100];

  rooms = signal<Room[]>([]);
  loading = signal(false);

  statusFilter = signal<StatusFilter>('ALL');
  searchTerm = '';

  readonly stats = computed(() => {
    const rooms = this.rooms();
    return {
      total: rooms.length,
      available: rooms.filter((r) => r.status === 'AVAILABLE').length,
      allocated: rooms.filter((r) => r.status === 'ALLOCATED').length,
      maintenance: rooms.filter((r) => r.status === 'MAINTENANCE').length
    };
  });

  readonly filteredRooms = computed(() => {
    const filter = this.statusFilter();
    const term = this.searchTermSignal().trim().toLowerCase();
    return this.rooms().filter((room) => {
      const matchesFilter = filter === 'ALL' || room.status === filter;
      const matchesTerm =
        !term || room.roomNumber.toLowerCase().includes(term) || (room.roomTypeName ?? '').toLowerCase().includes(term);
      return matchesFilter && matchesTerm;
    });
  });
  pagination = new TablePagination(this.filteredRooms);

  // Bridges the plain ngModel-bound searchTerm into the computed() above without risking the signal/ngModel pitfall.
  private readonly searchTermSignal = signal('');

  readonly totalPages = computed(() => Math.max(Math.ceil(this.pagination.length() / this.pagination.pageSize()), 1));
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  readonly rangeStart = computed(() => (this.pagination.length() === 0 ? 0 : this.pagination.pageIndex() * this.pagination.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min((this.pagination.pageIndex() + 1) * this.pagination.pageSize(), this.pagination.length()));

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load rooms.');
      }
    });
  }

  onSearch(): void {
    this.searchTermSignal.set(this.searchTerm);
    this.pagination.reset();
  }

  setFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
    this.pagination.reset();
  }

  onPageSizeChange(size: number): void {
    this.pagination.pageSize.set(size);
    this.pagination.reset();
  }

  goToPage(page: number): void {
    this.pagination.pageIndex.set(page - 1);
  }

  previousPage(): void {
    this.pagination.pageIndex.update((i) => Math.max(i - 1, 0));
  }

  nextPage(): void {
    this.pagination.pageIndex.update((i) => Math.min(i + 1, this.totalPages() - 1));
  }

  changeStatus(room: Room, newStatus: RoomStatus): void {
    if (room.id === null || newStatus === room.status) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Mark room ${room.roomNumber} as ${this.statusLabel[newStatus]}?`,
        message: `This changes the room's availability status from ${this.statusLabel[room.status]} to ${this.statusLabel[newStatus]}.`,
        confirmLabel: 'Confirm'
      })
      .subscribe((confirmed) => {
        if (!confirmed || room.id === null) {
          this.refresh();
          return;
        }
        this.service.updateStatus(room.id, newStatus).subscribe({
          next: () => {
            this.notification.success('Room status updated.');
            this.refresh();
          },
          error: (err) => {
            this.notification.error(err.error?.message ?? 'Failed to update room status.');
            this.refresh();
          }
        });
      });
  }
}
