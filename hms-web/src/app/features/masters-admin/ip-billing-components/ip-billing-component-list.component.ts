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
import { IpBillingCategory } from '../ip-billing-categories/ip-billing-category.model';
import { IpBillingCategoryService } from '../ip-billing-categories/ip-billing-category.service';
import { IpBillingComponentFormDialogComponent } from './ip-billing-component-form-dialog.component';
import { IpBillingComponent } from './ip-billing-component.model';
import { IpBillingComponentService } from './ip-billing-component.service';

/**
 * IP Billing Component master: one screen, two tabs (Active / Inactive),
 * mirroring OpBillingComponentListComponent's shape - Add/Edit share the same
 * dialog, delete is soft (deactivate) with a separate Restore action.
 */
@Component({
  selector: 'app-ip-billing-component-list',
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
  templateUrl: './ip-billing-component-list.component.html',
  styleUrl: './ip-billing-component-list.component.scss'
})
export class IpBillingComponentListComponent {
  private readonly service = inject(IpBillingComponentService);
  private readonly categoryService = inject(IpBillingCategoryService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['name', 'category', 'ipAmount', 'insuranceAmount', 'actions'];

  categories = signal<IpBillingCategory[]>([]);
  activeComponents = signal<IpBillingComponent[]>([]);
  inactiveComponents = signal<IpBillingComponent[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);

  constructor() {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.notification.error('Failed to load IP Billing Categories.')
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
        this.notification.error('Failed to load IP Billing Components.');
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
        this.notification.error('Failed to load inactive IP Billing Components.');
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
      this.notification.error('Add an IP Billing Category first.');
      return;
    }
    this.dialog
      .open(IpBillingComponentFormDialogComponent, { width: '560px', data: { categories: this.categories() } })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.service.create(result).subscribe({
          next: () => {
            this.notification.success('IP Billing Component added.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to create component.')
        });
      });
  }

  openEditDialog(component: IpBillingComponent): void {
    if (component.id === null) {
      return;
    }
    this.dialog
      .open(IpBillingComponentFormDialogComponent, {
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
            this.notification.success('IP Billing Component updated.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to update component.')
        });
      });
  }

  deactivate(component: IpBillingComponent): void {
    if (component.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${component.name}?`,
        message: 'This component will no longer be selectable in IP Billing. This can be reversed later.',
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

  restore(component: IpBillingComponent): void {
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
