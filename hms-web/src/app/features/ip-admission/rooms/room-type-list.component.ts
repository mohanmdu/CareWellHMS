import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { RoomType, RoomTypeInput } from './room-type.model';
import { RoomTypeService } from './room-type.service';

const EMPTY_FORM: RoomTypeInput = { name: '', rentCash: 0, rentClaim: 0 };

/**
 * Room Types master: inline Add/Update/Clear form (matching the legacy
 * screen's layout) plus separate Active/Deactivated tables below.
 */
@Component({
  selector: 'app-room-type-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './room-type-list.component.html',
  styleUrl: './room-type-list.component.scss'
})
export class RoomTypeListComponent {
  private readonly service = inject(RoomTypeService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['name', 'roomCount', 'rentCash', 'rentClaim', 'createdBy', 'actions'];
  readonly inactiveColumns = ['name', 'roomCount', 'rentCash', 'rentClaim', 'deactivatedBy', 'actions'];

  activeTypes = signal<RoomType[]>([]);
  inactiveTypes = signal<RoomType[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  editingId = signal<number | null>(null);
  form: RoomTypeInput = { ...EMPTY_FORM };

  constructor() {
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (types) => {
        this.activeTypes.set(types);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load room types.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (types) => {
        this.inactiveTypes.set(types);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated room types.');
      }
    });
  }

  edit(type: RoomType): void {
    if (type.id === null) {
      return;
    }
    this.editingId.set(type.id);
    this.form = { name: type.name, rentCash: type.rentCash, rentClaim: type.rentClaim };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.name.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Room type updated.' : 'Room type added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save room type.');
      }
    });
  }

  deactivate(type: RoomType): void {
    if (type.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${type.name}?`,
        message: 'This room type will no longer be selectable when adding rooms. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || type.id === null) {
          return;
        }
        this.service.deactivate(type.id).subscribe({
          next: () => {
            this.notification.success('Room type deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate room type.')
        });
      });
  }

  restore(type: RoomType): void {
    if (type.id === null) {
      return;
    }
    this.service.restore(type.id).subscribe({
      next: () => {
        this.notification.success('Room type restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore room type.')
    });
  }
}
