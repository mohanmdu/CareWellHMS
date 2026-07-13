import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { AppointmentAuditChangesDialogComponent } from './appointment-audit-changes-dialog.component';
import { AppointmentAuditLogEntry } from '../booking/appointment.model';
import { AppointmentService } from '../booking/appointment.service';

const OPERATION_LABEL: Partial<Record<string, string>> = {
  CREATE: 'Create',
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',
  BILL: 'Bill'
};

const OPERATION_TONE: Partial<Record<string, StatusBadgeTone>> = {
  CREATE: 'success',
  CONFIRM: 'info',
  CANCEL: 'danger',
  BILL: 'success'
};

/**
 * Audit trail for every Appointment create/confirm/cancel/bill (see
 * AppointmentService.recordAudit on the backend), mirroring
 * GeneralUserLogsComponent's shape (TablePagination/TableSearchComponent,
 * fetched once) plus a "View Changes" action for the before/after diff.
 */
@Component({
  selector: 'app-appointment-audit-log',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    TableSearchComponent
  ],
  templateUrl: './appointment-audit-log.component.html',
  styleUrl: './appointment-audit-log.component.scss'
})
export class AppointmentAuditLogComponent {
  private readonly service = inject(AppointmentService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'serialNo',
    'operation',
    'patientName',
    'consultantName',
    'departmentName',
    'appointmentSlot',
    'performedAt',
    'channel',
    'performedBy',
    'actions'
  ];
  readonly operationLabel = OPERATION_LABEL;
  readonly operationTone = OPERATION_TONE;

  logs = signal<AppointmentAuditLogEntry[]>([]);
  loading = signal(false);

  searchTerm = signal('');
  filteredLogs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.logs();
    }
    return this.logs().filter(
      (log) =>
        (log.patientName ?? '').toLowerCase().includes(term) ||
        (log.consultantName ?? '').toLowerCase().includes(term) ||
        (log.departmentName ?? '').toLowerCase().includes(term) ||
        (log.performedBy ?? '').toLowerCase().includes(term) ||
        (this.operationLabel[log.operation] ?? log.operation).toLowerCase().includes(term)
    );
  });
  pagination = new TablePagination(this.filteredLogs);

  constructor() {
    this.loading.set(true);
    this.service.getAuditLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load audit logs.');
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }

  viewChanges(log: AppointmentAuditLogEntry): void {
    this.dialog.open(AppointmentAuditChangesDialogComponent, {
      width: '480px',
      data: { log }
    });
  }
}
