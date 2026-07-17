import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { GrnViewDialogComponent } from '../purchase-management/grn/grn-view-dialog.component';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';
import { SALES_GST_REPORT_PRINT_STYLES } from './sales-gst-report-print-styles';
import { SupplierOutstandingReportEntry } from './supplier-payment.model';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Approved GRNs with the same computed paid/balance as Supplier Outstanding Payments; Invoice No reopens the existing GrnViewDialogComponent. */
@Component({
  selector: 'app-supplier-outstanding-report',
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
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './supplier-outstanding-report.component.html',
  styleUrl: './supplier-outstanding-report.component.scss'
})
export class SupplierOutstandingReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['vendorName', 'date', 'invoiceNo', 'totalAmount', 'paidAmount', 'balanceAmount'];

  entries = signal<SupplierOutstandingReportEntry[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  readonly totalBalance = computed(() => this.entries().reduce((sum, e) => sum + e.balanceAmount, 0));

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.supplierOutstandingReport(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Supplier Outstanding Report.');
      }
    });
  }

  viewGrn(entry: SupplierOutstandingReportEntry): void {
    this.dialog.open(GrnViewDialogComponent, { width: '960px', maxWidth: '95vw', data: { grnId: entry.grnId } });
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
          <title>Supplier Outstanding Report</title>
          <style>${SALES_GST_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
