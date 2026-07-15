import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PharmacyReturnSummary } from './pharmacy-return.model';
import { PharmacyReturnWorkflowService } from './pharmacy-return.service';
import { SalesReturnApproveDialogComponent } from './sales-return-approve-dialog.component';
import { SALES_RETURN_APPROVAL_PRINT_STYLES } from './sales-return-approval-print-styles';
import { SalesReturnPrintDialogComponent } from './sales-return-print-dialog.component';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

const CSV_HEADERS = ['S.No', 'Patient UHID', 'Patient Name', 'Location', 'Date & Time', 'Updated By'];

/**
 * "Sales Return List" - pending returns awaiting approval. Once approved
 * (see view()'s dialog/approve/refresh/print orchestration, the same shape
 * as po-pending-list.component.ts), a return disappears from here and shows
 * up only in Pharmacy Reports > Sales Return Report.
 */
@Component({
  selector: 'app-sales-return-approval-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './sales-return-approval-list.component.html',
  styleUrl: './sales-return-approval-list.component.scss'
})
export class SalesReturnApprovalListComponent {
  private readonly service = inject(PharmacyReturnWorkflowService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('listContent') listContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['patientRegistrationNumber', 'patientName', 'locationName', 'submittedAt', 'submittedBy', 'action'];

  entries = signal<PharmacyReturnSummary[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.listPending(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load pending sales returns.');
      }
    });
  }

  view(entry: PharmacyReturnSummary): void {
    this.service.get(entry.id).subscribe({
      next: (pharmacyReturn) => {
        this.dialog
          .open(SalesReturnApproveDialogComponent, { width: '640px', maxWidth: '95vw', data: { pharmacyReturn } })
          .afterClosed()
          .subscribe((confirmed) => {
            if (!confirmed) {
              return;
            }
            this.service.approve(entry.id).subscribe({
              next: (approved) => {
                this.notification.success('The Return Request has been Approved Successfully.');
                this.refresh();
                this.dialog.open(SalesReturnPrintDialogComponent, {
                  width: '640px',
                  maxWidth: '95vw',
                  data: { pharmacyReturn: approved }
                });
              },
              error: (err) => this.notification.error(err.error?.message ?? 'Failed to approve the return.')
            });
          });
      },
      error: () => this.notification.error('Failed to load the return.')
    });
  }

  export(): void {
    const rows = this.entries();
    if (rows.length === 0) {
      return;
    }
    const lines = [CSV_HEADERS.map(csvCell).join(',')];
    rows.forEach((entry, index) => {
      lines.push(
        [
          csvCell(index + 1),
          csvCell(entry.patientRegistrationNumber),
          csvCell(entry.patientName),
          csvCell(entry.locationName),
          csvCell(entry.submittedAt),
          csvCell(entry.submittedBy)
        ].join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-return-approval-${toIsoDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  print(): void {
    const content = this.listContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the list.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Return List</title>
          <style>${SALES_RETURN_APPROVAL_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
