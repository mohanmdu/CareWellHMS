import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { OpBillingCategory } from '../op-billing-categories/op-billing-category.model';
import { OpBillingCategoryService } from '../op-billing-categories/op-billing-category.service';
import { OpBillingComponentFormDialogComponent } from './op-billing-component-form-dialog.component';
import { OpBillingComponent } from './op-billing-component.model';
import { OpBillingComponentService } from './op-billing-component.service';

/**
 * OP Billing Component master: one screen, two tabs (Active / Inactive),
 * mirroring PatientRegistrationComponent's shape - Add/Edit share the same
 * dialog, delete is soft (deactivate) with a separate Restore action.
 */
@Component({
  selector: 'app-op-billing-component-list',
  standalone: true,
  imports: [
    DecimalPipe,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './op-billing-component-list.component.html',
  styleUrl: './op-billing-component-list.component.scss'
})
export class OpBillingComponentListComponent {
  private readonly service = inject(OpBillingComponentService);
  private readonly categoryService = inject(OpBillingCategoryService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['name', 'category', 'amount', 'actions'];

  categories = signal<OpBillingCategory[]>([]);
  activeComponents = signal<OpBillingComponent[]>([]);
  inactiveComponents = signal<OpBillingComponent[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);

  constructor() {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.notification.error('Failed to load OP Billing Categories.')
    });
    this.refreshActive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (components) => {
        this.activeComponents.set(components);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load OP Billing Components.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (components) => {
        this.inactiveComponents.set(components);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load inactive OP Billing Components.');
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  openAddDialog(): void {
    if (this.categories().length === 0) {
      this.notification.error('Add an OP Billing Category first.');
      return;
    }
    this.dialog
      .open(OpBillingComponentFormDialogComponent, { width: '560px', data: { categories: this.categories() } })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.service.create(result).subscribe({
          next: () => {
            this.notification.success('OP Billing Component added.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to create component.')
        });
      });
  }

  openEditDialog(component: OpBillingComponent): void {
    if (component.id === null) {
      return;
    }
    this.dialog
      .open(OpBillingComponentFormDialogComponent, {
        width: '560px',
        data: { categories: this.categories(), component }
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result || component.id === null) {
          return;
        }
        this.service.update(component.id, result).subscribe({
          next: () => {
            this.notification.success('OP Billing Component updated.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to update component.')
        });
      });
  }

  deactivate(component: OpBillingComponent): void {
    if (component.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${component.name}?`,
        message: 'This component will no longer be selectable in OP Direct Billing. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || component.id === null) {
          return;
        }
        this.service.deactivate(component.id).subscribe({
          next: () => {
            this.notification.success('Component deactivated.');
            this.refreshActive();
          },
          error: () => this.notification.error('Failed to deactivate component.')
        });
      });
  }

  restore(component: OpBillingComponent): void {
    if (component.id === null) {
      return;
    }
    this.service.restore(component.id).subscribe({
      next: () => {
        this.notification.success('Component restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore component.')
    });
  }
}
