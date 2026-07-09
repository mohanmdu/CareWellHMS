import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { PatientAuditLogEntry } from './patient.model';
import { PatientService } from './patient.service';

const OPERATION_TONE: Record<string, StatusBadgeTone> = {
  REGISTER: 'success',
  UPDATE: 'info',
  DELETE: 'warning',
  RESTORE: 'success',
  PERMANENT_DELETE: 'danger'
};

/**
 * Audit trail for every Patient Registration operation (register, update,
 * soft delete, restore, permanent delete), attributed to the authenticated
 * user who performed it (see PatientService.recordAudit on the backend).
 */
@Component({
  selector: 'app-patient-logs',
  standalone: true,
  imports: [DatePipe, MatTableModule, MatProgressBarModule, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './patient-logs.component.html',
  styleUrl: './patient-logs.component.scss'
})
export class PatientLogsComponent {
  private readonly service = inject(PatientService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['serialNo', 'operation', 'patientName', 'performedAt', 'performedBy'];
  readonly operationTone = OPERATION_TONE;

  logs = signal<PatientAuditLogEntry[]>([]);
  loading = signal(false);

  constructor() {
    this.loading.set(true);
    this.service.auditLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load logs.');
      }
    });
  }
}
