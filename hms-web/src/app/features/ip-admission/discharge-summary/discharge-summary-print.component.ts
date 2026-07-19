import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { REPORT_PRINT_STYLES } from '../reports/report-print-styles';
import { DischargeSummary } from './discharge-summary.model';
import { DischargeSummaryService } from './discharge-summary.service';

/** Read-only, print-optimized rendering of a saved Discharge Summary (matches the reference's single-sheet print layout). */
@Component({
  selector: 'app-discharge-summary-print',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './discharge-summary-print.component.html',
  styleUrl: './discharge-summary-print.component.scss'
})
export class DischargeSummaryPrintComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DischargeSummaryService);
  private readonly notification = inject(NotificationService);

  private readonly admissionId = Number(this.route.snapshot.paramMap.get('admissionId'));

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  loading = signal(true);
  summary = signal<DischargeSummary | null>(null);

  constructor() {
    this.service.getByAdmission(this.admissionId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the discharge summary.');
      }
    });
  }

  back(): void {
    this.router.navigate(['/ip/discharge-summary']);
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary</title>
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
