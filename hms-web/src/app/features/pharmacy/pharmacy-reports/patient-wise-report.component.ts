import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { PatientBillEntry, PatientStatement } from './pharmacy-statement-report.model';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';
import { SALES_GST_REPORT_PRINT_STYLES } from './sales-gst-report-print-styles';

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
 * Bill Wise / Details Report as two tabs of one page. IPID is accepted but
 * treated as an alias of UHID (registrationNumber) - no separate IP
 * admission link exists on PharmacySale (see plan doc). Clicking a Bill No
 * switches to Details Report and loads that specific bill's statement,
 * matching the legacy spec's redirection wording literally.
 */
@Component({
  selector: 'app-patient-wise-report',
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
    MatTabsModule,
    EmptyStateComponent
  ],
  templateUrl: './patient-wise-report.component.html',
  styleUrl: './patient-wise-report.component.scss'
})
export class PatientWiseReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('statementContent') statementContent?: ElementRef<HTMLElement>;

  clinicSettings = signal<ClinicSettings | null>(null);
  bills = signal<PatientBillEntry[]>([]);
  statement = signal<PatientStatement | null>(null);
  loading = signal(false);
  activeTabIndex = signal(0);
  readonly today = new Date();

  uhid = '';
  ipid = '';
  nameOrMobile = '';
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  readonly totalInvoiced = computed(() => this.bills().reduce((sum, b) => sum + b.invoicedAmount, 0));
  readonly totalDue = computed(() => this.bills().reduce((sum, b) => sum + b.dueAmount, 0));
  readonly medicalSum = computed(() => (this.statement()?.medicalItems ?? []).reduce((sum, i) => sum + i.netAmount, 0));
  readonly nonMedicalSum = computed(() => (this.statement()?.nonMedicalItems ?? []).reduce((sum, i) => sum + i.netAmount, 0));

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
  }

  getDetails(): void {
    const registrationNumber = this.uhid.trim() || this.ipid.trim() || undefined;
    this.loading.set(true);
    this.service.patientBills(registrationNumber, this.nameOrMobile.trim() || undefined, toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (bills) => {
        this.bills.set(bills);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load patient bills.');
      }
    });
  }

  search(): void {
    this.getDetails();
  }

  viewBill(bill: PatientBillEntry): void {
    this.service.patientStatement(bill.saleId).subscribe({
      next: (statement) => {
        this.statement.set(statement);
        this.activeTabIndex.set(1);
      },
      error: () => this.notification.error('Failed to load the patient statement.')
    });
  }

  print(): void {
    const content = this.statementContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the statement.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Statement</title>
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
