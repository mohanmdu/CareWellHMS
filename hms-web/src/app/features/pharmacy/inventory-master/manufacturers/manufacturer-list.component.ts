import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ManufacturerFormDialogComponent } from './manufacturer-form-dialog.component';
import { Manufacturer } from './manufacturer.model';
import { ManufacturerService } from './manufacturer.service';

/**
 * Manufacturer master: one screen, two tabs (Active / Inactive), same shape
 * as SupplierListComponent - Add/Edit share the same dialog, delete is soft
 * (deactivate) with a separate Restore action.
 */
@Component({
  selector: 'app-manufacturer-list',
  standalone: true,
  imports: [MatTabsModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './manufacturer-list.component.html',
  styleUrl: './manufacturer-list.component.scss'
})
export class ManufacturerListComponent {
  private readonly service = inject(ManufacturerService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['name', 'contactPersonName', 'phoneNumber', 'address', 'actions'];

  activeManufacturers = signal<Manufacturer[]>([]);
  inactiveManufacturers = signal<Manufacturer[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);

  constructor() {
    this.refreshActive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (manufacturers) => {
        this.activeManufacturers.set(manufacturers);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load manufacturers.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (manufacturers) => {
        this.inactiveManufacturers.set(manufacturers);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load inactive manufacturers.');
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  openAddDialog(): void {
    this.dialog
      .open(ManufacturerFormDialogComponent, { width: '560px', data: {} })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.service.create(result).subscribe({
          next: () => {
            this.notification.success('Manufacturer added.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to create manufacturer.')
        });
      });
  }

  openEditDialog(manufacturer: Manufacturer): void {
    if (manufacturer.id === null) {
      return;
    }
    this.dialog
      .open(ManufacturerFormDialogComponent, { width: '560px', data: { manufacturer } })
      .afterClosed()
      .subscribe((result) => {
        if (!result || manufacturer.id === null) {
          return;
        }
        this.service.update(manufacturer.id, result).subscribe({
          next: () => {
            this.notification.success('Manufacturer updated.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to update manufacturer.')
        });
      });
  }

  deactivate(manufacturer: Manufacturer): void {
    if (manufacturer.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${manufacturer.name}?`,
        message: 'This manufacturer will no longer be selectable elsewhere in the system. This can be reversed later by an administrator.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || manufacturer.id === null) {
          return;
        }
        this.service.deactivate(manufacturer.id).subscribe({
          next: () => {
            this.notification.success('Manufacturer deactivated.');
            this.refreshActive();
          },
          error: () => this.notification.error('Failed to deactivate manufacturer.')
        });
      });
  }

  restore(manufacturer: Manufacturer): void {
    if (manufacturer.id === null) {
      return;
    }
    this.service.restore(manufacturer.id).subscribe({
      next: () => {
        this.notification.success('Manufacturer restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore manufacturer.')
    });
  }
}
