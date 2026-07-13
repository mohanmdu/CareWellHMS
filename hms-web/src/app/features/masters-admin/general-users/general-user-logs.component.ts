import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { GeneralUserAuditLogEntry } from './general-user.model';
import { GeneralUserService } from './general-user.service';

const OPERATION_LABEL: Partial<Record<string, string>> = {
  CREATE: 'Create User',
  UPDATE: 'Update User',
  DEACTIVATE: 'Deactivate User',
  RESTORE: 'Activate User'
};

const OPERATION_TONE: Partial<Record<string, StatusBadgeTone>> = {
  CREATE: 'success',
  UPDATE: 'info',
  DEACTIVATE: 'warning',
  RESTORE: 'success'
};

/**
 * Audit trail for every General User operation (create, update, deactivate,
 * activate), mirroring Patient Registration's Logs screen.
 */
@Component({
  selector: 'app-general-user-logs',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    TableSearchComponent
  ],
  templateUrl: './general-user-logs.component.html',
  styleUrl: './general-user-logs.component.scss'
})
export class GeneralUserLogsComponent {
  private readonly service = inject(GeneralUserService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['serialNo', 'operation', 'userName', 'performedAt', 'performedBy'];
  readonly operationLabel = OPERATION_LABEL;
  readonly operationTone = OPERATION_TONE;

  logs = signal<GeneralUserAuditLogEntry[]>([]);
  loading = signal(false);

  searchTerm = signal('');
  filteredLogs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.logs();
    }
    return this.logs().filter(
      (log) =>
        log.userName.toLowerCase().includes(term) ||
        log.performedBy.toLowerCase().includes(term) ||
        (this.operationLabel[log.operation] ?? log.operation).toLowerCase().includes(term)
    );
  });
  pagination = new TablePagination(this.filteredLogs);

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

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }
}
