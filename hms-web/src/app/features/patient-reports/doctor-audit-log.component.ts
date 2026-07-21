import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../shared/services/notification.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PatientReportAuditLogRow } from './patient-report.model';
import { PatientReportService } from './patient-report.service';

const IMAGE_FILE_TYPES = ['JPG', 'JPEG', 'PNG', 'WEBP'];

/**
 * Uploaded Audit Logs for Doctor (screen 3 of 3): the same upload history,
 * scoped to patients who have a resolvable treating doctor (their most
 * recent Appointment's consultant) - see PatientReportService.getDoctorAuditLog().
 */
@Component({
  selector: 'app-doctor-audit-log',
  standalone: true,
  imports: [DatePipe, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './doctor-audit-log.component.html',
  styleUrl: './doctor-audit-log.component.scss'
})
export class DoctorAuditLogComponent {
  private readonly service = inject(PatientReportService);
  private readonly notification = inject(NotificationService);

  loading = signal(true);
  rows = signal<PatientReportAuditLogRow[]>([]);

  constructor() {
    this.service.getDoctorAuditLog().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the doctor audit log.');
      }
    });
  }

  isImage(row: PatientReportAuditLogRow): boolean {
    return IMAGE_FILE_TYPES.includes(row.fileType);
  }
}
