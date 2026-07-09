import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BillingCategory } from '../categories/billing-category.model';
import { BillingCategoryService } from '../categories/billing-category.service';
import { BillingItem } from './billing-item.model';
import { BillingItemService } from './billing-item.service';

@Component({
  selector: 'app-billing-catalog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './billing-catalog.component.html'
})
export class BillingCatalogComponent {
  private readonly categoryService = inject(BillingCategoryService);
  private readonly itemService = inject(BillingItemService);

  categories = signal<BillingCategory[]>([]);
  items = signal<BillingItem[]>([]);
  errorMessage = signal<string | null>(null);

  newCategoryName = '';
  newItem = { name: '', categoryId: null as number | null, price: 0 };

  constructor() {
    this.refreshCategories();
    this.refreshItems();
  }

  refreshCategories(): void {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.errorMessage.set('Failed to load billing categories.')
    });
  }

  refreshItems(): void {
    this.itemService.list().subscribe({
      next: (items) => this.items.set(items),
      error: () => this.errorMessage.set('Failed to load billing items.')
    });
  }

  addCategory(): void {
    if (!this.newCategoryName.trim()) {
      return;
    }
    this.categoryService.create({ name: this.newCategoryName.trim() }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.refreshCategories();
      },
      error: () => this.errorMessage.set('Failed to create billing category.')
    });
  }

  addItem(): void {
    if (!this.newItem.name.trim() || !this.newItem.categoryId) {
      return;
    }
    this.itemService
      .create({ name: this.newItem.name.trim(), categoryId: this.newItem.categoryId, price: this.newItem.price })
      .subscribe({
        next: () => {
          this.newItem = { name: '', categoryId: null, price: 0 };
          this.refreshItems();
        },
        error: () => this.errorMessage.set('Failed to create billing item.')
      });
  }

  deactivateCategory(category: BillingCategory): void {
    if (category.id === null) return;
    this.categoryService.deactivate(category.id).subscribe({ next: () => this.refreshCategories() });
  }

  deactivateItem(item: BillingItem): void {
    if (item.id === null) return;
    this.itemService.deactivate(item.id).subscribe({ next: () => this.refreshItems() });
  }
}
