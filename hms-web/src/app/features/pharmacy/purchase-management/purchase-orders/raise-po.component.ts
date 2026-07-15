import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Product } from '../../inventory-master/products/product.model';
import { ProductService } from '../../inventory-master/products/product.service';
import { Supplier } from '../../inventory-master/suppliers/supplier.model';
import { SupplierService } from '../../inventory-master/suppliers/supplier.service';
import { PoPrintDialogComponent } from './po-print-dialog.component';
import { PurchaseOrderWorkingItem } from './purchase-order.model';
import { PurchaseOrderService } from './purchase-order.service';

function emptyNewItem() {
  return {
    productId: null as number | null,
    productSearch: '',
    productTypeName: null as string | null,
    packing: 1,
    qty: 1,
    totalQty: 1
  };
}

/**
 * Raise PO: pick a Supplier, repeatedly add product lines to a running
 * table, Submit creates the PO in PENDING_APPROVAL - same "add then submit"
 * shape as OpDirectBillingComponent, Product autocomplete modeled on
 * OpCaseSheetDialogComponent's drug-name mat-autocomplete.
 */
@Component({
  selector: 'app-raise-po',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './raise-po.component.html',
  styleUrl: './raise-po.component.scss'
})
export class RaisePoComponent {
  private readonly service = inject(PurchaseOrderService);
  private readonly supplierService = inject(SupplierService);
  private readonly productService = inject(ProductService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly itemColumns = ['productName', 'productTypeName', 'packing', 'qty', 'totalQty', 'remove'];

  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);
  supplierId = signal<number | null>(null);
  items = signal<PurchaseOrderWorkingItem[]>([]);
  comments = '';
  saving = signal(false);

  newItem = emptyNewItem();

  constructor() {
    this.supplierService.list().subscribe({
      next: (suppliers) => this.suppliers.set(suppliers),
      error: () => this.notification.error('Failed to load suppliers.')
    });
    this.productService.list().subscribe({
      next: (products) => this.products.set(products),
      error: () => this.notification.error('Failed to load products.')
    });
  }

  /**
   * Returns the full list until the user starts typing, not [] - an empty
   * search term isn't "no matches", it's "hasn't searched yet", and showing
   * the "no matching products" empty-state before any typing made it look
   * like Product Master data wasn't being fetched at all.
   */
  filteredProducts(): Product[] {
    const term = this.newItem.productSearch.trim().toLowerCase();
    if (!term) {
      return this.products();
    }
    return this.products().filter((product) => product.name.toLowerCase().includes(term));
  }

  onProductSelected(product: Product): void {
    this.newItem.productId = product.id;
    this.newItem.productSearch = product.name;
    this.newItem.productTypeName = product.productTypeName;
  }

  /**
   * Add is gated on this, not just newItem.productId - productId only ever
   * gets set by actually picking a suggestion (onProductSelected), but if
   * the user then keeps typing/deletes characters afterward without
   * re-selecting, productId would otherwise stay set to a product whose
   * name no longer matches what's shown in the field. Requiring the search
   * text to still match the selected product's name closes that gap without
   * needing an (ngModelChange) handler racing against the autocomplete's
   * own selection write-back.
   */
  get selectedProduct(): Product | null {
    const product = this.products().find((p) => p.id === this.newItem.productId);
    return product && product.name === this.newItem.productSearch ? product : null;
  }

  addItem(): void {
    const product = this.selectedProduct;
    if (!product || this.newItem.qty <= 0) {
      return;
    }
    this.items.set([
      ...this.items(),
      {
        productId: product.id!,
        productName: product.name,
        productTypeName: product.productTypeName,
        packing: this.newItem.packing,
        qty: this.newItem.qty,
        totalQty: this.newItem.totalQty
      }
    ]);
    this.newItem = emptyNewItem();
  }

  removeItem(index: number): void {
    this.items.set(this.items().filter((_, i) => i !== index));
  }

  submit(): void {
    const supplierId = this.supplierId();
    if (!supplierId || this.items().length === 0) {
      return;
    }
    this.saving.set(true);
    this.service
      .create({
        supplierId,
        items: this.items().map((item) => ({
          productId: item.productId,
          packing: item.packing,
          qty: item.qty,
          totalQty: item.totalQty
        })),
        comments: this.comments.trim() || null
      })
      .subscribe({
        next: (purchaseOrder) => {
          this.saving.set(false);
          this.dialog.open(PoPrintDialogComponent, {
            width: '720px',
            maxWidth: '95vw',
            data: { purchaseOrder }
          });
          this.reset();
        },
        error: (err) => {
          this.saving.set(false);
          this.notification.error(err.error?.message ?? 'Failed to raise the purchase order.');
        }
      });
  }

  reset(): void {
    this.supplierId.set(null);
    this.items.set([]);
    this.newItem = emptyNewItem();
    this.comments = '';
  }
}
