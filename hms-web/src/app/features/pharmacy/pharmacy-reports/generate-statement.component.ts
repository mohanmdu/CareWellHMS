import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { GENERATE_STATEMENT_PRINT_STYLES } from './generate-statement-print-styles';
import { PharmacyStatementEntry } from './pharmacy-statement-report.model';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Cash Payments statement - PharmacySale rows with paymentMode=CASH within the selected range. */
@Component({
  selector: 'app-generate-statement',
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
  templateUrl: './generate-statement.component.html',
  styleUrl: './generate-statement.component.scss'
})
export class GenerateStatementComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['billNumber', 'registrationNumber', 'patientType', 'patientName', 'date', 'createdBy', 'amount'];

  clinicSettings = signal<ClinicSettings | null>(null);
  entries = signal<PharmacyStatementEntry[]>([]);
  loading = signal(false);
  loaded = signal(false);

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());
  readonly today = new Date();

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
  }

  getStatement(): void {
    this.loading.set(true);
    this.service.cashStatement(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
        this.loaded.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the statement.');
      }
    });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the statement.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Pharmacy Statement</title>
          <style>${GENERATE_STATEMENT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
