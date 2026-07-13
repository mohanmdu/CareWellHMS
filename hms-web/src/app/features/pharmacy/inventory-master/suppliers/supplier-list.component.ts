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
import { SupplierFormDialogComponent } from './supplier-form-dialog.component';
import { Supplier } from './supplier.model';
import { SupplierService } from './supplier.service';

/**
 * Supplier master: one screen, two tabs (Active / Inactive), mirroring
 * OpBillingComponentListComponent's shape - Add/Edit share the same dialog,
 * delete is soft (deactivate) with a separate Restore action.
 */
@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [MatTabsModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent {
  private readonly service = inject(SupplierService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['name', 'contactPersonName', 'mobileNumber', 'address', 'city', 'actions'];

  activeSuppliers = signal<Supplier[]>([]);
  inactiveSuppliers = signal<Supplier[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);

  constructor() {
    this.refreshActive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (suppliers) => {
        this.activeSuppliers.set(suppliers);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load suppliers.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (suppliers) => {
        this.inactiveSuppliers.set(suppliers);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load inactive suppliers.');
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
      .open(SupplierFormDialogComponent, { width: '560px', data: {} })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.service.create(result).subscribe({
          next: () => {
            this.notification.success('Supplier added.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to create supplier.')
        });
      });
  }

  openEditDialog(supplier: Supplier): void {
    if (supplier.id === null) {
      return;
    }
    this.dialog
      .open(SupplierFormDialogComponent, { width: '560px', data: { supplier } })
      .afterClosed()
      .subscribe((result) => {
        if (!result || supplier.id === null) {
          return;
        }
        this.service.update(supplier.id, result).subscribe({
          next: () => {
            this.notification.success('Supplier updated.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to update supplier.')
        });
      });
  }

  deactivate(supplier: Supplier): void {
    if (supplier.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${supplier.name}?`,
        message: 'This supplier will no longer be selectable elsewhere in the system. This can be reversed later by an administrator.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || supplier.id === null) {
          return;
        }
        this.service.deactivate(supplier.id).subscribe({
          next: () => {
            this.notification.success('Supplier deactivated.');
            this.refreshActive();
          },
          error: () => this.notification.error('Failed to deactivate supplier.')
        });
      });
  }

  restore(supplier: Supplier): void {
    if (supplier.id === null) {
      return;
    }
    this.service.restore(supplier.id).subscribe({
      next: () => {
        this.notification.success('Supplier restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore supplier.')
    });
  }
}
