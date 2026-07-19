import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { ACTIVITY_LOG_MODULES, ACTIVITY_LOG_OPERATIONS, ACTIVITY_LOG_STATUSES, ActivityLog } from './activity-log.model';
import { ActivityLogService } from './activity-log.service';

const STATUS_TONE: Partial<Record<string, StatusBadgeTone>> = {
  Success: 'success',
  Approved: 'success',
  Updated: 'info',
  Pending: 'warning',
  Cancelled: 'danger',
  Deleted: 'danger'
};

function toIsoDate(dateInput: string): string | undefined {
  return dateInput || undefined;
}

/** IP/OP Billing Activity Log ("IP/OP Tracking Report"): cross-module transaction audit trail. */
@Component({
  selector: 'app-activity-log-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    TableSearchComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './activity-log-list.component.html',
  styleUrl: './activity-log-list.component.scss'
})
export class ActivityLogListComponent {
  private readonly activityLogService = inject(ActivityLogService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly statusTone = STATUS_TONE;
  readonly modules = ACTIVITY_LOG_MODULES;
  readonly operations = ACTIVITY_LOG_OPERATIONS;
  readonly statuses = ACTIVITY_LOG_STATUSES;

  fromDate = '';
  toDate = '';
  filterPatientUhid = '';
  filterPatientName = '';
  filterOpNumber = '';
  filterIpNumber = '';
  filterModule = '';
  filterOperation = '';
  filterPerformedBy = '';
  filterStatus = '';
  showAdvancedFilters = signal(false);

  loading = signal(false);
  searched = signal(false);
  rows = signal<ActivityLog[]>([]);
  quickSearchTerm = signal('');

  filteredRows = computed(() => {
    const term = this.quickSearchTerm().trim().toLowerCase();
    if (!term) {
      return this.rows();
    }
    return this.rows().filter(
      (row) =>
        (row.patientUhid ?? '').toLowerCase().includes(term) ||
        (row.patientName ?? '').toLowerCase().includes(term) ||
        (row.ipNumber ?? '').toLowerCase().includes(term) ||
        (row.opNumber ?? '').toLowerCase().includes(term) ||
        row.content?.toLowerCase().includes(term)
    );
  });

  pagination = new TablePagination(this.filteredRows);

  constructor() {
    this.search();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  onQuickSearch(term: string): void {
    this.quickSearchTerm.set(term);
    this.pagination.reset();
  }

  search(): void {
    this.loading.set(true);
    this.activityLogService
      .search({
        fromDate: toIsoDate(this.fromDate),
        toDate: toIsoDate(this.toDate),
        patientUhid: this.filterPatientUhid.trim(),
        patientName: this.filterPatientName.trim(),
        opNumber: this.filterOpNumber.trim(),
        ipNumber: this.filterIpNumber.trim(),
        module: this.filterModule,
        operation: this.filterOperation,
        performedBy: this.filterPerformedBy.trim(),
        status: this.filterStatus
      })
      .subscribe({
        next: (rows) => {
          this.rows.set(rows);
          this.loading.set(false);
          this.searched.set(true);
          this.pagination.reset();
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the activity log.');
        }
      });
  }

  viewDetails(row: ActivityLog): void {
    this.router.navigate(['/ip/reports/activity-log', row.id]);
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
          <title>IP/OP Billing Activity Log</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 24px; }
            h1 { font-size: 1.25rem; margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #1565c0; color: #fff; }
          </style>
        </head>
        <body>
          <h1>IP/OP Billing Activity Log</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  exportCsv(): void {
    const rows = this.filteredRows();
    if (rows.length === 0) {
      return;
    }
    const header = [
      'S.No',
      'Patient UHID',
      'Patient Name',
      'OP Number',
      'IP Number',
      'Module',
      'Operation',
      'Content',
      'Previous Content',
      'Created By',
      'Action Time',
      'Status'
    ];
    const csvCell = (value: string | number | null | undefined): string => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const lines = [header.map(csvCell).join(',')];
    rows.forEach((row, index) => {
      lines.push(
        [
          csvCell(index + 1),
          csvCell(row.patientUhid),
          csvCell(row.patientName),
          csvCell(row.opNumber),
          csvCell(row.ipNumber),
          csvCell(row.module),
          csvCell(row.operation),
          csvCell(row.content),
          csvCell(row.previousContent),
          csvCell(row.performedBy),
          csvCell(row.performedAt),
          csvCell(row.status)
        ].join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ip-op-activity-log.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
