import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { DischargeListRow } from '../ip-billing/ip-billing.model';
import { IpBillingService } from '../ip-billing/ip-billing.service';
import { REPORT_PRINT_STYLES } from '../reports/report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Discharge List (PDF): read-only archive of fully DISCHARGED admissions with a full invoiced/paid/refund/discount/balance breakdown. */
@Component({
  selector: 'app-discharge-list',
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
    EmptyStateComponent
  ],
  templateUrl: './discharge-list.component.html',
  styleUrl: './discharge-list.component.scss'
})
export class DischargeListComponent {
  private readonly billingService = inject(IpBillingService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  clinicSettings = signal<ClinicSettings | null>(null);
  rows = signal<DischargeListRow[]>([]);
  loading = signal(false);
  searched = signal(false);

  fromDate: Date | null = null;
  toDate: Date | null = null;
  billingType: 'ALL' | 'CASH' | 'CLAIM' = 'ALL';

  totals = computed(() => {
    const rows = this.rows();
    return {
      invoicedAmount: rows.reduce((sum, r) => sum + r.invoicedAmount, 0),
      paidAmount: rows.reduce((sum, r) => sum + r.paidAmount, 0),
      refundAmount: rows.reduce((sum, r) => sum + r.refundAmount, 0),
      discountAmount: rows.reduce((sum, r) => sum + r.discountAmount, 0),
      balanceAmount: rows.reduce((sum, r) => sum + r.balanceAmount, 0)
    };
  });

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.billingService.getDischargeList(toIsoDate(this.fromDate), toIsoDate(this.toDate), this.billingType).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the discharge list.');
      }
    });
  }

  viewBilling(row: DischargeListRow): void {
    this.router.navigate(['/ip/admissions', row.admissionId, 'billing']);
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge List</title>
          <style>${REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
