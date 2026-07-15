import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { PURCHASE_TYPES, PURCHASE_TYPE_LABELS, PurchaseType, GrnWorkingItem } from './grn.model';
import { GrnService } from './grn.service';

function emptyNewItem() {
  return {
    productId: null as number | null,
    productSearch: '',
    productTypeName: null as string | null,
    packing: 1,
    qty: 1,
    totalQty: 1,
    freeQty: 0,
    batch: '',
    expiryDate: null as Date | null,
    manufactureDate: null as Date | null,
    mrp: null as number | null,
    purchaseRate: 0,
    discountPercent: 0,
    hsnSac: '',
    sgstPercent: 0,
    cgstPercent: 0
  };
}

function toIsoDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * GRN entry form - Supplier + header fields, a running item table (Product
 * autocomplete auto-fills Drug Type/HSN/SGST%/CGST% from Product Master,
 * still editable per row for products with no GST configured), computed Net
 * Value per row + totals footer, Invoice/GRN Amount read-only (= totals
 * sum). `readonly` suppresses the entry row and action buttons for viewing
 * a past GRN from the GRN List tab.
 */
@Component({
  selector: 'app-grn-form',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './grn-form.component.html',
  styleUrl: './grn-form.component.scss'
})
export class GrnFormComponent {
  private readonly service = inject(GrnService);
  private readonly supplierService = inject(SupplierService);
  private readonly productService = inject(ProductService);
  private readonly notification = inject(NotificationService);

  readonly readonly = input(false);
  /** Set to view/continue-editing an existing (draft) GRN; leave unset for a brand-new one. */
  readonly grnId = input<number | null>(null);
  /** Emitted after a successful create/update (draft save or final approve), so a hosting Draft GRN list knows to refresh. */
  readonly saved = output<void>();

  readonly itemColumns = [
    'productName',
    'productTypeName',
    'packing',
    'qty',
    'totalQty',
    'freeQty',
    'batch',
    'expiryDate',
    'mrp',
    'purchaseRate',
    'discountPercent',
    'hsnSac',
    'sgstPercent',
    'cgstPercent',
    'netValue',
    'remove'
  ];
  readonly purchaseTypes = PURCHASE_TYPES;
  readonly purchaseTypeLabels = PURCHASE_TYPE_LABELS;

  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);
  items = signal<GrnWorkingItem[]>([]);
  saving = signal(false);
  loading = signal(false);

  supplierId = signal<number | null>(null);
  purchaseType: PurchaseType = 'CREDIT';
  invoiceNo = '';
  invoiceDate: Date | null = null;
  poNumber = '';
  grnDate: Date | null = new Date();
  discountAmount: number | null = 0;
  creditNote = '';
  debitNote = '';
  returnAmount: number | null = 0;
  status: 'DRAFT' | 'APPROVED' = 'DRAFT';

  newItem = emptyNewItem();

  invoiceAmount = computed(() => this.items().reduce((sum, item) => sum + item.netValue, 0));
  totalDiscount = computed(() => this.items().reduce((sum, item) => sum + (item.discountAmount ?? 0), 0));
  totalSgst = computed(() => this.items().reduce((sum, item) => sum + item.sgstAmount, 0));
  totalCgst = computed(() => this.items().reduce((sum, item) => sum + item.cgstAmount, 0));

  constructor() {
    this.supplierService.list().subscribe({
      next: (suppliers) => this.suppliers.set(suppliers),
      error: () => this.notification.error('Failed to load suppliers.')
    });
    this.productService.list().subscribe({
      next: (products) => this.products.set(products),
      error: () => this.notification.error('Failed to load products.')
    });

    effect(() => {
      const id = this.grnId();
      if (id) {
        this.loadForView(id);
      }
    });
  }

  private loadForView(id: number): void {
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: (grn) => {
        this.supplierId.set(grn.supplierId);
        this.purchaseType = grn.purchaseType;
        this.invoiceNo = grn.invoiceNo;
        this.invoiceDate = new Date(grn.invoiceDate);
        this.poNumber = grn.poNumber ?? '';
        this.grnDate = new Date(grn.grnDate);
        this.discountAmount = grn.discountAmount;
        this.creditNote = grn.creditNote ?? '';
        this.debitNote = grn.debitNote ?? '';
        this.returnAmount = grn.returnAmount;
        this.items.set(
          grn.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productTypeName: item.productTypeName,
            packing: item.packing,
            qty: item.qty,
            totalQty: item.totalQty,
            freeQty: item.freeQty,
            batch: item.batch,
            expiryDate: item.expiryDate,
            manufactureDate: item.manufactureDate,
            mrp: item.mrp,
            purchaseRate: item.purchaseRate,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            hsnSac: item.hsnSac,
            sgstPercent: item.sgstPercent,
            sgstAmount: item.sgstAmount,
            cgstPercent: item.cgstPercent,
            cgstAmount: item.cgstAmount,
            netValue: item.netValue
          }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load GRN.');
      }
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
    this.newItem.hsnSac = product.hsnSac ?? '';
    this.newItem.sgstPercent = product.stateGst ?? 0;
    this.newItem.cgstPercent = product.centralGst ?? 0;
  }

  /**
   * Add is gated on this, not just newItem.productId - see RaisePoComponent's
   * identical getter for the full reasoning (productId only gets set by
   * actually picking a suggestion; this closes the gap where further typing
   * after a selection would otherwise leave a stale productId in place).
   */
  get selectedProduct(): Product | null {
    const product = this.products().find((p) => p.id === this.newItem.productId);
    return product && product.name === this.newItem.productSearch ? product : null;
  }

  private computeNetValue(
    purchaseRate: number,
    totalQty: number,
    discountPercent: number,
    sgstPercent: number,
    cgstPercent: number
  ): { discountAmount: number; sgstAmount: number; cgstAmount: number; netValue: number } {
    const gross = purchaseRate * totalQty;
    const discountAmount = (gross * discountPercent) / 100;
    const taxable = gross - discountAmount;
    const sgstAmount = (taxable * sgstPercent) / 100;
    const cgstAmount = (taxable * cgstPercent) / 100;
    return { discountAmount, sgstAmount, cgstAmount, netValue: taxable + sgstAmount + cgstAmount };
  }

  addItem(): void {
    const product = this.selectedProduct;
    if (!product || this.newItem.qty <= 0 || this.newItem.purchaseRate <= 0) {
      return;
    }
    const computedValues = this.computeNetValue(
      this.newItem.purchaseRate,
      this.newItem.totalQty,
      this.newItem.discountPercent,
      this.newItem.sgstPercent,
      this.newItem.cgstPercent
    );
    this.items.set([
      ...this.items(),
      {
        productId: product.id!,
        productName: product.name,
        productTypeName: this.newItem.productTypeName,
        packing: this.newItem.packing,
        qty: this.newItem.qty,
        totalQty: this.newItem.totalQty,
        freeQty: this.newItem.freeQty,
        batch: this.newItem.batch.trim() || null,
        expiryDate: toIsoDate(this.newItem.expiryDate),
        manufactureDate: toIsoDate(this.newItem.manufactureDate),
        mrp: this.newItem.mrp,
        purchaseRate: this.newItem.purchaseRate,
        discountPercent: this.newItem.discountPercent,
        discountAmount: computedValues.discountAmount,
        hsnSac: this.newItem.hsnSac.trim() || null,
        sgstPercent: this.newItem.sgstPercent,
        sgstAmount: computedValues.sgstAmount,
        cgstPercent: this.newItem.cgstPercent,
        cgstAmount: computedValues.cgstAmount,
        netValue: computedValues.netValue
      }
    ]);
    this.newItem = emptyNewItem();
  }

  removeItem(index: number): void {
    this.items.set(this.items().filter((_, i) => i !== index));
  }

  private submit(status: 'DRAFT' | 'APPROVED'): void {
    const supplierId = this.supplierId();
    if (!supplierId || this.items().length === 0 || !this.invoiceNo.trim() || !this.invoiceDate || !this.grnDate) {
      return;
    }
    this.saving.set(true);
    const request = {
      supplierId,
      purchaseType: this.purchaseType,
      invoiceNo: this.invoiceNo.trim(),
      invoiceDate: toIsoDate(this.invoiceDate)!,
      poNumber: this.poNumber.trim() || null,
      grnDate: toIsoDate(this.grnDate)!,
      discountAmount: this.discountAmount,
      creditNote: this.creditNote.trim() || null,
      debitNote: this.debitNote.trim() || null,
      returnAmount: this.returnAmount,
      items: this.items().map((item) => ({
        productId: item.productId,
        packing: item.packing,
        qty: item.qty,
        totalQty: item.totalQty,
        freeQty: item.freeQty,
        batch: item.batch,
        expiryDate: item.expiryDate,
        manufactureDate: item.manufactureDate,
        mrp: item.mrp,
        purchaseRate: item.purchaseRate,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        hsnSac: item.hsnSac,
        sgstPercent: item.sgstPercent,
        cgstPercent: item.cgstPercent
      })),
      status
    };

    const existingId = this.grnId();
    const request$ = existingId ? this.service.update(existingId, request) : this.service.create(request);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(status === 'APPROVED' ? 'GRN approved.' : 'GRN saved as draft.');
        this.reset();
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save GRN.');
      }
    });
  }

  approve(): void {
    this.submit('APPROVED');
  }

  saveAsDraft(): void {
    this.submit('DRAFT');
  }

  reset(): void {
    this.supplierId.set(null);
    this.items.set([]);
    this.newItem = emptyNewItem();
    this.purchaseType = 'CREDIT';
    this.invoiceNo = '';
    this.invoiceDate = null;
    this.poNumber = '';
    this.grnDate = new Date();
    this.discountAmount = 0;
    this.creditNote = '';
    this.debitNote = '';
    this.returnAmount = 0;
  }
}
