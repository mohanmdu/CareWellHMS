import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyBillPrintDialogComponent } from '../pharmacy-billing/pharmacy-bill-print-dialog.component';
import { PharmacySaleListEntry } from '../pharmacy-billing/pharmacy-sale.model';
import { PharmacySaleService } from '../pharmacy-billing/pharmacy-sale.service';
import { PharmacyReturnListEntry } from './pharmacy-return.model';
import { PharmacyReturnService } from './pharmacy-return.service';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Sales / Return / Credit sub-tabs. Credit only lists CREDIT-billed sales with
 * balanceAmount > 0 (fully-paid credit bills are omitted) - see plan Context
 * note on the garbled "Return Report" instruction whose screenshot was
 * actually the Credit Report tab.
 */
@Component({
  selector: 'app-detailed-sales-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatTabsModule,
    EmptyStateComponent
  ],
  templateUrl: './detailed-sales-report.component.html',
  styleUrl: './detailed-sales-report.component.scss'
})
export class DetailedSalesReportComponent {
  private readonly saleService = inject(PharmacySaleService);
  private readonly returnService = inject(PharmacyReturnService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly saleColumns = ['billNumber', 'patientName', 'source', 'billedAt', 'totalAmount', 'discountAmount', 'amountPaid', 'balanceAmount'];
  readonly returnColumns = ['billNumber', 'productName', 'quantity', 'amount', 'returnedAt', 'returnedBy'];

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());

  sales = signal<PharmacySaleListEntry[]>([]);
  returns = signal<PharmacyReturnListEntry[]>([]);
  loading = signal(false);
  returnsLoaded = false;

  creditSales = computed(() => this.sales().filter((entry) => entry.billingType === 'CREDIT' && entry.balanceAmount > 0));

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.saleService
      .search({ fromDate: toIsoDate(this.fromDate()), toDate: toIsoDate(this.toDate()) })
      .subscribe({
        next: (entries) => {
          this.sales.set(entries);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the sales report.');
        }
      });
    if (this.returnsLoaded) {
      this.loadReturns();
    }
  }

  onTabChange(index: number): void {
    if (index === 1 && !this.returnsLoaded) {
      this.loadReturns();
    }
  }

  private loadReturns(): void {
    this.returnsLoaded = true;
    this.returnService.search(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => this.returns.set(entries),
      error: () => this.notification.error('Failed to load returns.')
    });
  }

  viewBill(entry: PharmacySaleListEntry): void {
    this.saleService.get(entry.id).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '900px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load bill.')
    });
  }
}
