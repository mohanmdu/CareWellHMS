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
import { TaxStatementEntry } from './pharmacy-statement-report.model';
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

/** Same SGST+CGST tax data as VAT Statement, grouped by month instead of day. */
@Component({
  selector: 'app-gst-statement',
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
  templateUrl: './gst-statement.component.html',
  styleUrl: './gst-statement.component.scss'
})
export class GstStatementComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['period', 'taxAmount'];

  clinicSettings = signal<ClinicSettings | null>(null);
  entries = signal<TaxStatementEntry[]>([]);
  loading = signal(false);
  loaded = signal(false);
  readonly today = new Date();

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
  }

  getDetails(): void {
    this.loading.set(true);
    this.service.gstStatement(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
        this.loaded.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the GST statement.');
      }
    });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the statement.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Pharmacy GST Statement</title>
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
