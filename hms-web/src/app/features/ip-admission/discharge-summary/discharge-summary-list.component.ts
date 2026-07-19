import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
import { REPORT_PRINT_STYLES } from '../reports/report-print-styles';
import { DischargeSummaryListRow } from './discharge-summary.model';
import { DischargeSummaryService } from './discharge-summary.service';

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
 * Discharge Summary List (IP Main module): clinical-documentation columns
 * only (no billing breakdown - see the separate financial DischargeListComponent
 * at /ip/discharge-list for that). Edit opens the multi-section clinical
 * form; View (enabled only once a summary has been saved) opens the
 * read-only print sheet.
 */
@Component({
  selector: 'app-discharge-summary-list',
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
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './discharge-summary-list.component.html',
  styleUrl: './discharge-summary-list.component.scss'
})
export class DischargeSummaryListComponent {
  private readonly service = inject(DischargeSummaryService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  clinicSettings = signal<ClinicSettings | null>(null);
  rows = signal<DischargeSummaryListRow[]>([]);
  loading = signal(false);
  searched = signal(false);

  fromDate: Date | null = null;
  toDate: Date | null = null;
  billingType: 'ALL' | 'CASH' | 'CLAIM' = 'ALL';

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.service.list(toIsoDate(this.fromDate), toIsoDate(this.toDate), this.billingType).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the discharge summary list.');
      }
    });
  }

  editSummary(row: DischargeSummaryListRow): void {
    this.router.navigate(['/ip/discharge-summary', row.admissionId, 'edit']);
  }

  viewSummary(row: DischargeSummaryListRow): void {
    this.router.navigate(['/ip/discharge-summary', row.admissionId, 'print']);
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
