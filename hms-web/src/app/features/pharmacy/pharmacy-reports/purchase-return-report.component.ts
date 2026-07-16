import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import {
  PHARMACY_PURCHASE_RETURN_TYPE_LABELS,
  PharmacyPurchaseReturnSummary,
  PharmacyPurchaseReturnType
} from '../purchase-return/purchase-return.model';
import { PurchaseReturnPrintDialogComponent } from '../purchase-return/purchase-return-print-dialog.component';
import { PurchaseReturnService } from '../purchase-return/purchase-return.service';
import { PURCHASE_RETURN_REPORT_PRINT_STYLES } from './purchase-return-report-print-styles';

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
 * No Location filter - Purchase Return has no location dimension in its own
 * data model (a Main-Store/supplier-facing operation), so the legacy
 * report's Location dropdown is omitted as bleed-over from a shared
 * report-shell template (see plan Context).
 */
@Component({
  selector: 'app-purchase-return-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './purchase-return-report.component.html',
  styleUrl: './purchase-return-report.component.scss'
})
export class PurchaseReturnReportComponent {
  private readonly service = inject(PurchaseReturnService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['id', 'returnType', 'remarks', 'createdAt', 'returnedBy', 'totalAmount'];
  readonly returnTypeLabels = PHARMACY_PURCHASE_RETURN_TYPE_LABELS;

  entries = signal<PharmacyPurchaseReturnSummary[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());

  totalAmount = computed(() => this.entries().reduce((sum, entry) => sum + entry.totalAmount, 0));

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.search(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Purchase Return Report.');
      }
    });
  }

  returnTypeLabel(type: PharmacyPurchaseReturnType): string {
    return this.returnTypeLabels[type];
  }

  viewReturn(entry: PharmacyPurchaseReturnSummary): void {
    this.service.get(entry.id).subscribe({
      next: (purchaseReturn) => this.dialog.open(PurchaseReturnPrintDialogComponent, { width: '720px', maxWidth: '95vw', data: { purchaseReturn } }),
      error: () => this.notification.error('Failed to load the return.')
    });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Return Report</title>
          <style>${PURCHASE_RETURN_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
