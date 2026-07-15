import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyBillPrintDialogComponent } from '../pharmacy-billing/pharmacy-bill-print-dialog.component';
import { PharmacyLocation } from '../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../pharmacy-billing/pharmacy-location.service';
import {
  PHARMACY_PAYMENT_MODE_LABELS,
  PharmacyPaymentMode,
  PharmacySaleListEntry,
  PharmacySaleSource
} from '../pharmacy-billing/pharmacy-sale.model';
import { PharmacySaleService } from '../pharmacy-billing/pharmacy-sale.service';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const SOURCE_FILTERS: { label: string; value: PharmacySaleSource | null }[] = [
  { label: 'All', value: null },
  { label: 'OP', value: 'OP' },
  { label: 'IP', value: 'IP' },
  { label: 'Others', value: 'OTHERS' }
];

const MODE_FILTERS: { label: string; value: PharmacyPaymentMode | null }[] = [
  { label: 'All', value: null },
  { label: 'Cash', value: 'CASH' },
  { label: 'Debit Card', value: 'DEBIT_CARD' },
  { label: 'Credit Card', value: 'CREDIT_CARD' }
];

/** Sales Report - filters + table, clickable Bill No reopens the read-only bill dialog. */
@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent {
  private readonly service = inject(PharmacySaleService);
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['billNumber', 'patientName', 'source', 'paymentMode', 'billedAt', 'billedBy', 'totalAmount'];
  readonly sourceFilters = SOURCE_FILTERS;
  readonly modeFilters = MODE_FILTERS;

  locations = signal<PharmacyLocation[]>([]);
  entries = signal<PharmacySaleListEntry[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());
  source: PharmacySaleSource | null = null;
  paymentMode: PharmacyPaymentMode | null = null;
  locationId: number | null = null;
  billedBy = '';

  totalAmount = computed(() => this.entries().reduce((sum, entry) => sum + entry.totalAmount, 0));

  constructor() {
    this.locationService.list().subscribe({ next: (locations) => this.locations.set(locations), error: () => {} });
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service
      .search({
        fromDate: toIsoDate(this.fromDate()),
        toDate: toIsoDate(this.toDate()),
        source: this.source ?? undefined,
        paymentMode: this.paymentMode ?? undefined,
        locationId: this.locationId ?? undefined,
        billedBy: this.billedBy.trim() || undefined
      })
      .subscribe({
        next: (entries) => {
          this.entries.set(entries);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the sales report.');
        }
      });
  }

  viewBill(entry: PharmacySaleListEntry): void {
    this.service.get(entry.id).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '640px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load bill.')
    });
  }
}
