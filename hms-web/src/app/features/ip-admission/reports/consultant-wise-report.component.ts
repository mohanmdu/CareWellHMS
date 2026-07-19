import { DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { IpConsultantWiseReportRow } from '../ip-billing/ip-billing.model';
import { IpBillingService } from '../ip-billing/ip-billing.service';
import { REPORT_PRINT_STYLES } from './report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** IP Billing Master > Consultant Wise Report: IP billing amounts grouped by consultant over a date range. */
@Component({
  selector: 'app-consultant-wise-report',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './consultant-wise-report.component.html',
  styleUrl: './consultant-wise-report.component.scss'
})
export class ConsultantWiseReportComponent {
  private readonly billingService = inject(IpBillingService);
  private readonly consultantService = inject(ConsultantService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  consultants = signal<Consultant[]>([]);
  rows = signal<IpConsultantWiseReportRow[]>([]);
  loading = signal(false);
  searched = signal(false);

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);
  consultantId = signal<number | null>(null);

  totalAmount = computed(() => this.rows().reduce((sum, row) => sum + row.amount, 0));

  constructor() {
    this.consultantService.list().subscribe({
      next: (consultants) => this.consultants.set(consultants),
      error: () => this.notification.error('Failed to load consultants.')
    });
    this.search();
  }

  displayName(row: IpConsultantWiseReportRow): string {
    return row.specializationName ? `${row.consultantName} - ${row.specializationName}` : row.consultantName;
  }

  search(): void {
    this.loading.set(true);
    this.billingService
      .getConsultantWiseReport(toIsoDate(this.fromDate()), toIsoDate(this.toDate()), this.consultantId() ?? undefined)
      .subscribe({
        next: (rows) => {
          this.rows.set(rows);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the consultant wise report.');
        }
      });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Consultant Wise Report For IP</title>
          <style>${REPORT_PRINT_STYLES}</style>
        </head>
        <body>
          <h1>Consultant Wise Report For IP</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
