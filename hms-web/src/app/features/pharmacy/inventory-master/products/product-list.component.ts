import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin, Observable } from 'rxjs';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { Manufacturer } from '../manufacturers/manufacturer.model';
import { ManufacturerService } from '../manufacturers/manufacturer.service';
import { ProductType } from '../product-types/product-type.model';
import { ProductTypeService } from '../product-types/product-type.service';
import { Rack } from '../racks/rack.model';
import { RackService } from '../racks/rack.service';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { MEDICAL_CATEGORY_LABELS, Product } from './product.model';
import { ProductService } from './product.service';

/**
 * Product master: one screen, two tabs (Active / Inactive), same shape as
 * SupplierListComponent/ManufacturerListComponent - Add/Edit share the same
 * dialog, delete is soft (deactivate) with a separate Restore action. The
 * dialog's Product Type/Rack/Manufacturer dropdowns are populated from the
 * active lists loaded here, same pattern as OpBillingComponent's Category
 * dropdown.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatTabsModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private readonly service = inject(ProductService);
  private readonly productTypeService = inject(ProductTypeService);
  private readonly rackService = inject(RackService);
  private readonly manufacturerService = inject(ManufacturerService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'name', 'productTypeName', 'manufacturerName', 'rackName', 'actions'];
  readonly medicalCategoryLabels = MEDICAL_CATEGORY_LABELS;

  productTypes = signal<ProductType[]>([]);
  racks = signal<Rack[]>([]);
  manufacturers = signal<Manufacturer[]>([]);

  activeProducts = signal<Product[]>([]);
  inactiveProducts = signal<Product[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);

  constructor() {
    this.refreshDropdownData().subscribe({
      next: (data) => this.applyDropdownData(data),
      error: () => this.notification.error('Failed to load Product Type/Rack/Manufacturer masters.')
    });
    this.refreshActive();
  }

  /**
   * Re-fetches Product Type/Rack/Manufacturer from the API rather than
   * relying on the signals loaded once at construction - all five Inventory
   * Master tabs are created once and kept alive for the tab group's
   * lifetime, so without this, a Product Type/Rack/Manufacturer added in its
   * own tab would never show up in this dialog's dropdowns until a full
   * page reload. Called again right before the Add/Edit dialog opens.
   */
  private refreshDropdownData(): Observable<{
    productTypes: ProductType[];
    racks: Rack[];
    manufacturers: Manufacturer[];
  }> {
    return forkJoin({
      productTypes: this.productTypeService.list(),
      racks: this.rackService.list(),
      manufacturers: this.manufacturerService.list()
    });
  }

  private applyDropdownData(data: { productTypes: ProductType[]; racks: Rack[]; manufacturers: Manufacturer[] }): void {
    this.productTypes.set(data.productTypes);
    this.racks.set(data.racks);
    this.manufacturers.set(data.manufacturers);
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (products) => {
        this.activeProducts.set(products);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load products.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (products) => {
        this.inactiveProducts.set(products);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load inactive products.');
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  openAddDialog(): void {
    this.refreshDropdownData().subscribe({
      next: (data) => {
        this.applyDropdownData(data);
        if (data.productTypes.length === 0 || data.racks.length === 0) {
          this.notification.error('Add a Product Type and a Rack first.');
          return;
        }
        this.dialog
          .open(ProductFormDialogComponent, {
            width: '640px',
            maxWidth: '95vw',
            data: { productTypes: data.productTypes, racks: data.racks, manufacturers: data.manufacturers }
          })
          .afterClosed()
          .subscribe((result) => {
            if (!result) {
              return;
            }
            this.service.create(result).subscribe({
              next: () => {
                this.notification.success('Product created.');
                this.refreshActive();
              },
              error: (err) => this.notification.error(err.error?.message ?? 'Failed to create product.')
            });
          });
      },
      error: () => this.notification.error('Failed to load Product Type/Rack/Manufacturer masters.')
    });
  }

  openEditDialog(product: Product): void {
    if (product.id === null) {
      return;
    }
    this.refreshDropdownData().subscribe({
      next: (data) => {
        this.applyDropdownData(data);
        this.dialog
          .open(ProductFormDialogComponent, {
            width: '640px',
            maxWidth: '95vw',
            data: {
              productTypes: data.productTypes,
              racks: data.racks,
              manufacturers: data.manufacturers,
              product
            }
          })
          .afterClosed()
          .subscribe((result) => {
            if (!result || product.id === null) {
              return;
            }
            this.service.update(product.id, result).subscribe({
              next: () => {
                this.notification.success('Product updated.');
                this.refreshActive();
              },
              error: (err) => this.notification.error(err.error?.message ?? 'Failed to update product.')
            });
          });
      },
      error: () => this.notification.error('Failed to load Product Type/Rack/Manufacturer masters.')
    });
  }

  deactivate(product: Product): void {
    if (product.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${product.name}?`,
        message: 'This product will no longer be selectable elsewhere in the system. This can be reversed later by an administrator.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || product.id === null) {
          return;
        }
        this.service.deactivate(product.id).subscribe({
          next: () => {
            this.notification.success('Product deactivated.');
            this.refreshActive();
          },
          error: () => this.notification.error('Failed to deactivate product.')
        });
      });
  }

  restore(product: Product): void {
    if (product.id === null) {
      return;
    }
    this.service.restore(product.id).subscribe({
      next: () => {
        this.notification.success('Product restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore product.')
    });
  }
}
