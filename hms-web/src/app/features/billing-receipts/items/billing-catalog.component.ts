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
import { MasterCrudComponent } from '../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../shared/master-crud/master-crud.model';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { BillingCategory } from '../categories/billing-category.model';
import { BillingCategoryService } from '../categories/billing-category.service';
import { BillingItem } from './billing-item.model';
import { BillingItemService } from './billing-item.service';

/**
 * Categories are a simple { id, name, active } master, so the left column is
 * the shared MasterCrudComponent<T> in embedded mode; items carry a category
 * + price and stay hand-built (§5.2), like Consultants.
 */
@Component({
  selector: 'app-billing-catalog',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MasterCrudComponent,
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
  templateUrl: './billing-catalog.component.html',
  styleUrl: './billing-catalog.component.scss'
})
export class BillingCatalogComponent {
  private readonly categoryService = inject(BillingCategoryService);
  private readonly itemService = inject(BillingItemService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly displayedColumns = ['name', 'category', 'price', 'status', 'actions'];

  readonly categoryConfig: MasterCrudConfig<BillingCategory> = {
    title: 'Categories',
    entityLabel: 'category',
    getId: (category) => category.id,
    getName: (category) => category.name,
    getActive: (category) => category.active,
    list: () => this.categoryService.list(),
    create: (name) => this.categoryService.create({ name }),
    deactivate: (id) => this.categoryService.deactivate(id)
  };

  categories = signal<BillingCategory[]>([]);
  items = signal<BillingItem[]>([]);
  loading = signal(false);
  saving = signal(false);

  newItem = { name: '', categoryId: null as number | null, price: 0 };

  constructor() {
    this.refreshCategories();
    this.refreshItems();
  }

  refreshCategories(): void {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.notification.error('Failed to load billing categories.')
    });
  }

  refreshItems(): void {
    this.loading.set(true);
    this.itemService.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load billing items.');
      }
    });
  }

  addItem(): void {
    if (!this.newItem.name.trim() || !this.newItem.categoryId) {
      return;
    }
    this.saving.set(true);
    this.itemService
      .create({ name: this.newItem.name.trim(), categoryId: this.newItem.categoryId, price: this.newItem.price })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.newItem = { name: '', categoryId: null, price: 0 };
          this.notification.success('Billing item added.');
          this.refreshItems();
        },
        error: () => {
          this.saving.set(false);
          this.notification.error('Failed to create billing item.');
        }
      });
  }

  deactivateItem(item: BillingItem): void {
    if (item.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${item.name}?`,
        message: 'This item will no longer be selectable when creating new invoices.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || item.id === null) {
          return;
        }
        this.itemService.deactivate(item.id).subscribe({
          next: () => {
            this.notification.success('Billing item deactivated.');
            this.refreshItems();
          },
          error: () => this.notification.error('Failed to deactivate billing item.')
        });
      });
  }
}
