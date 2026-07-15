import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
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
import { NotificationService } from '../../../shared/services/notification.service';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { Patient } from '../../registration/patients/patient.model';
import { PharmacyBillPrintDialogComponent } from './pharmacy-bill-print-dialog.component';
import {
  PHARMACY_BILLING_TYPES,
  PHARMACY_BILLING_TYPE_LABELS,
  PHARMACY_PAYMENT_MODES,
  PHARMACY_PAYMENT_MODE_LABELS,
  PharmacyBillingType,
  PharmacyPaymentMode,
  PharmacySaleSource,
  PharmacySaleWorkingItem
} from './pharmacy-sale.model';
import { PharmacySaleService } from './pharmacy-sale.service';
import { PharmacyStock } from './pharmacy-stock.model';
import { PharmacyStockService } from './pharmacy-stock.service';

const EXPIRY_ALERT_DAYS = 90;

function emptyNewItem() {
  return { stockId: null as number | null, search: '' };
}

/**
 * Shared billing-entry screen for both "Others" (walk-in) and pending-request
 * billing - the patient/source/request are supplied by the caller
 * (PharmacyRequestSearchComponent), everything here (item entry, billing
 * info, discount info, Final Approve) is identical either way. Item entry
 * sells against a specific PharmacyStock batch (not a bare Product) - this
 * is genuinely a different interaction than GRN's entry row (GRN creates new
 * batches by manual entry; this sells from existing ones by selection), so
 * it isn't literally the same component as grn-form's item row despite the
 * surface-level similarity.
 */
@Component({
  selector: 'app-pharmacy-bill-entry',
  standalone: true,
  imports: [
    DecimalPipe,
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
  templateUrl: './pharmacy-bill-entry.component.html',
  styleUrl: './pharmacy-bill-entry.component.scss'
})
export class PharmacyBillEntryComponent {
  private readonly stockService = inject(PharmacyStockService);
  private readonly consultantService = inject(ConsultantService);
  private readonly saleService = inject(PharmacySaleService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly patient = input.required<Patient>();
  readonly locationId = input.required<number>();
  readonly source = input.required<PharmacySaleSource>();
  readonly pharmacyRequestId = input<number | null>(null);

  readonly billed = output<void>();

  readonly itemColumns = ['productName', 'productTypeName', 'batch', 'expiryDate', 'quantity', 'mrp', 'netAmount', 'remove'];
  readonly billingTypes = PHARMACY_BILLING_TYPES;
  readonly billingTypeLabels = PHARMACY_BILLING_TYPE_LABELS;
  readonly paymentModes = PHARMACY_PAYMENT_MODES;
  readonly paymentModeLabels = PHARMACY_PAYMENT_MODE_LABELS;

  stock = signal<PharmacyStock[]>([]);
  consultants = signal<Consultant[]>([]);
  items = signal<PharmacySaleWorkingItem[]>([]);
  saving = signal(false);

  newItem = emptyNewItem();
  quantity = 1;

  billingType: PharmacyBillingType = 'CASH';
  paymentMode: PharmacyPaymentMode = 'CASH';
  consultantId: number | null = null;
  discountPercent: number | null = null;
  discountAmount: number | null = 0;
  discountReason = '';
  /** Legacy UX enters what's still owed, not what's paid - amountPaid is derived from this. */
  balanceEntered = 0;
  remarks = '';

  totalAmount = computed(() => this.items().reduce((sum, item) => sum + item.amount, 0));
  amountPayable = computed(() => this.totalAmount() - (this.discountAmount ?? 0));

  constructor() {
    this.stockService.list().subscribe({
      next: (stock) => this.stock.set(stock),
      error: () => this.notification.error('Failed to load available stock.')
    });
    this.consultantService.list().subscribe({
      next: (consultants) => this.consultants.set(consultants),
      error: () => this.notification.error('Failed to load consultants.')
    });
  }

  filteredStock(): PharmacyStock[] {
    const term = this.newItem.search.trim().toLowerCase();
    const available = this.stock().filter((s) => s.quantityOnHand > 0);
    if (!term) {
      return available;
    }
    return available.filter((s) => s.productName.toLowerCase().includes(term));
  }

  get selectedStock(): PharmacyStock | null {
    const stock = this.stock().find((s) => s.id === this.newItem.stockId);
    return stock ?? null;
  }

  onStockSelected(stock: PharmacyStock): void {
    this.newItem.stockId = stock.id;
    this.newItem.search = `${stock.productName} - Batch ${stock.batch ?? '-'}`;
    this.quantity = 1;

    if (stock.expiryDate) {
      const expiry = new Date(stock.expiryDate);
      const alertBy = new Date();
      alertBy.setDate(alertBy.getDate() + EXPIRY_ALERT_DAYS);
      if (expiry <= alertBy) {
        this.notification.error(`${stock.productName} (batch ${stock.batch ?? '-'}) expires on ${stock.expiryDate} - within ${EXPIRY_ALERT_DAYS} days.`);
      }
    }
  }

  addItem(): void {
    const stock = this.selectedStock;
    if (!stock || this.quantity <= 0) {
      return;
    }
    if (this.quantity > stock.quantityOnHand) {
      this.notification.error(`Only ${stock.quantityOnHand} of ${stock.productName} (batch ${stock.batch ?? '-'}) available.`);
      return;
    }
    const mrp = stock.mrp ?? 0;
    this.items.set([
      ...this.items(),
      {
        stockId: stock.id,
        productName: stock.productName,
        productTypeName: stock.productTypeName,
        batch: stock.batch,
        expiryDate: stock.expiryDate,
        mrp: stock.mrp,
        quantityAvailable: stock.quantityOnHand,
        quantity: this.quantity,
        amount: mrp * this.quantity
      }
    ]);
    this.newItem = emptyNewItem();
    this.quantity = 1;
  }

  removeItem(index: number): void {
    this.items.set(this.items().filter((_, i) => i !== index));
  }

  onDiscountPercentChange(): void {
    if (this.discountPercent != null) {
      this.discountAmount = (this.totalAmount() * this.discountPercent) / 100;
    }
  }

  approve(): void {
    if (this.items().length === 0) {
      return;
    }
    const amountPaid = this.amountPayable() - this.balanceEntered;
    this.saving.set(true);
    this.saleService
      .create({
        patientId: this.patient().id!,
        locationId: this.locationId(),
        source: this.source(),
        pharmacyRequestId: this.pharmacyRequestId(),
        billingType: this.billingType,
        paymentMode: this.paymentMode,
        consultantId: this.consultantId,
        discountPercent: this.discountPercent,
        discountAmount: this.discountAmount,
        discountReason: this.discountReason.trim() || null,
        items: this.items().map((item) => ({ stockId: item.stockId, quantity: item.quantity })),
        amountPaid,
        remarks: this.remarks.trim() || null
      })
      .subscribe({
        next: (sale) => {
          this.saving.set(false);
          this.dialog.open(PharmacyBillPrintDialogComponent, { width: '640px', maxWidth: '95vw', data: { sale } });
          this.billed.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.notification.error(err.error?.message ?? 'Failed to approve the bill.');
        }
      });
  }
}
