import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ReviewDateReportEntry } from '../../appointments/prescriptions/op-case-sheet.model';
import { OpCaseSheetService } from '../../appointments/prescriptions/op-case-sheet.service';

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
 * Standalone screen (split out of Patient Prescription's former "Review Date
 * Report" tab) so it's a first-class Patient Registration module rather than
 * one tab buried inside Appointments > Patient Prescription.
 */
@Component({
  selector: 'app-review-date-report',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './review-date-report.component.html',
  styleUrl: './review-date-report.component.scss'
})
export class ReviewDateReportComponent {
  private readonly service = inject(OpCaseSheetService);
  private readonly notification = inject(NotificationService);

  readonly reviewColumns = [
    'patientName',
    'patientId',
    'age',
    'gender',
    'mobile',
    'appointmentDate',
    'consultant',
    'reviewDate',
    'whatsapp'
  ];

  reviewEntries = signal<ReviewDateReportEntry[]>([]);
  loadingReview = signal(false);
  reviewSearched = signal(false);
  reviewStatus = signal<'upcoming' | 'completed'>('upcoming');
  reviewFromDate = signal<Date | null>(null);
  reviewToDate = signal<Date | null>(null);

  constructor() {
    this.refreshReviewReport();
  }

  setReviewStatus(status: 'upcoming' | 'completed'): void {
    this.reviewStatus.set(status);
    this.refreshReviewReport();
  }

  refreshReviewReport(): void {
    this.loadingReview.set(true);
    this.service
      .reviewDateReport({
        fromDate: toIsoDate(this.reviewFromDate()),
        toDate: toIsoDate(this.reviewToDate()),
        upcoming: this.reviewStatus() === 'upcoming'
      })
      .subscribe({
        next: (entries) => {
          this.reviewEntries.set(entries);
          this.loadingReview.set(false);
          this.reviewSearched.set(true);
        },
        error: () => {
          this.loadingReview.set(false);
          this.notification.error('Failed to load the review date report.');
        }
      });
  }

  /** wa.me deep link with a prefilled reminder - no backend WhatsApp integration exists, this just opens WhatsApp with the message ready to send. */
  whatsAppLink(entry: ReviewDateReportEntry): string {
    const digits = (entry.mobileNumber ?? '').replace(/\D/g, '');
    const message = `Hi ${entry.patientName ?? ''}, this is a reminder for your follow-up review with ${entry.consultantName ?? 'your consultant'} on ${entry.reviewDate}.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }
}
