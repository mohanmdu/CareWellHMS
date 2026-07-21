import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../shared/services/notification.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PatientReportAuditLogRow } from './patient-report.model';
import { PatientReportService } from './patient-report.service';

const IMAGE_FILE_TYPES = ['JPG', 'JPEG', 'PNG', 'WEBP'];

/** Uploaded Audit Logs for Patient (screen 2 of 3): every upload, regardless of later deletion. */
@Component({
  selector: 'app-patient-audit-log',
  standalone: true,
  imports: [DatePipe, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './patient-audit-log.component.html',
  styleUrl: './patient-audit-log.component.scss'
})
export class PatientAuditLogComponent {
  private readonly service = inject(PatientReportService);
  private readonly notification = inject(NotificationService);

  loading = signal(true);
  rows = signal<PatientReportAuditLogRow[]>([]);

  constructor() {
    this.service.getPatientAuditLog().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the patient audit log.');
      }
    });
  }

  isImage(row: PatientReportAuditLogRow): boolean {
    return IMAGE_FILE_TYPES.includes(row.fileType);
  }
}
