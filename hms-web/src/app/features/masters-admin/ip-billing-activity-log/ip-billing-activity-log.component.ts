import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { IpBillingActivityLogEntry } from './ip-billing-activity-log.model';
import { IpBillingActivityLogService } from './ip-billing-activity-log.service';

const OPERATION_LABEL: Partial<Record<string, string>> = {
  CREATE: 'Create',
  UPDATE: 'Update',
  DEACTIVATE: 'Deactivate',
  RESTORE: 'Activate'
};

const OPERATION_TONE: Partial<Record<string, StatusBadgeTone>> = {
  CREATE: 'success',
  UPDATE: 'info',
  DEACTIVATE: 'warning',
  RESTORE: 'success'
};

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Billing Activity Log: audit trail of every IP Billing Component create/update/deactivate/restore. */
@Component({
  selector: 'app-ip-billing-activity-log',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    TableSearchComponent
  ],
  templateUrl: './ip-billing-activity-log.component.html',
  styleUrl: './ip-billing-activity-log.component.scss'
})
export class IpBillingActivityLogComponent {
  private readonly service = inject(IpBillingActivityLogService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['serialNo', 'operation', 'content', 'previousContent', 'performedBy', 'performedAt'];
  readonly operationLabel = OPERATION_LABEL;
  readonly operationTone = OPERATION_TONE;

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  logs = signal<IpBillingActivityLogEntry[]>([]);
  loading = signal(false);

  searchTerm = signal('');
  filteredLogs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.logs();
    }
    return this.logs().filter(
      (log) =>
        log.componentName.toLowerCase().includes(term) ||
        log.performedBy.toLowerCase().includes(term) ||
        (this.operationLabel[log.operation] ?? log.operation).toLowerCase().includes(term)
    );
  });
  pagination = new TablePagination(this.filteredLogs);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.search(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
        this.pagination.reset();
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Billing Activity Log.');
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }
}
