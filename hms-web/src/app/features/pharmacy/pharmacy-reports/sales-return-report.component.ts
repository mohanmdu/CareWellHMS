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
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyLocation } from '../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../pharmacy-billing/pharmacy-location.service';
import { PHARMACY_RETURN_TYPE_LABELS, PharmacyReturnType, PharmacyReturnSummary } from '../pharmacy-returns/pharmacy-return.model';
import { PharmacyReturnWorkflowService } from '../pharmacy-returns/pharmacy-return.service';
import { SalesReturnPrintDialogComponent } from '../pharmacy-returns/sales-return-print-dialog.component';
import { SALES_RETURN_REPORT_PRINT_STYLES } from './sales-return-report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Approved sales returns - filters + table, clickable Return ID reopens the read-only print dialog. */
@Component({
  selector: 'app-sales-return-report',
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
    MatSelectModule,
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './sales-return-report.component.html',
  styleUrl: './sales-return-report.component.scss'
})
export class SalesReturnReportComponent {
  private readonly service = inject(PharmacyReturnWorkflowService);
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['id', 'patientName', 'returnType', 'approvedAt', 'approvedBy', 'totalAmount'];

  returnTypeLabel(type: PharmacyReturnType): string {
    return PHARMACY_RETURN_TYPE_LABELS[type];
  }

  locations = signal<PharmacyLocation[]>([]);
  entries = signal<PharmacyReturnSummary[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());
  locationId: number | null = null;

  totalAmount = computed(() => this.entries().reduce((sum, entry) => sum + entry.totalAmount, 0));

  constructor() {
    this.locationService.list().subscribe({ next: (locations) => this.locations.set(locations), error: () => {} });
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.listReport(toIsoDate(this.fromDate()), toIsoDate(this.toDate()), this.locationId ?? undefined).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the sales return report.');
      }
    });
  }

  viewReturn(entry: PharmacyReturnSummary): void {
    this.service.get(entry.id).subscribe({
      next: (pharmacyReturn) => this.dialog.open(SalesReturnPrintDialogComponent, { width: '640px', maxWidth: '95vw', data: { pharmacyReturn } }),
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
          <title>Sales Return Report</title>
          <style>${SALES_RETURN_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
