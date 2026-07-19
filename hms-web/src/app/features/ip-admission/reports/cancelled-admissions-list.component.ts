import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { CancelledAdmissionRow } from '../ip-billing/ip-billing.model';
import { IpBillingService } from '../ip-billing/ip-billing.service';

const REFUND_STATUS_TONE: Partial<Record<string, StatusBadgeTone>> = {
  Pending: 'warning',
  Completed: 'success',
  'Not Applicable': 'neutral'
};

function nowForDateTimeLocal(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

/** Cancelled Admissions (PDF): audit/reporting screen for admissions voided before discharge. */
@Component({
  selector: 'app-cancelled-admissions-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    TableSearchComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './cancelled-admissions-list.component.html',
  styleUrl: './cancelled-admissions-list.component.scss'
})
export class CancelledAdmissionsListComponent {
  private readonly billingService = inject(IpBillingService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly refundStatusTone = REFUND_STATUS_TONE;

  fromDateTime = '';
  toDateTime = nowForDateTimeLocal();

  loading = signal(false);
  searched = signal(false);
  rows = signal<CancelledAdmissionRow[]>([]);
  searchTerm = signal('');

  filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.rows();
    }
    return this.rows().filter(
      (row) =>
        (row.patientUhid ?? '').toLowerCase().includes(term) ||
        (row.patientName ?? '').toLowerCase().includes(term) ||
        (row.admissionNumber ?? '').toLowerCase().includes(term) ||
        (row.cancellationReason ?? '').toLowerCase().includes(term)
    );
  });

  pagination = new TablePagination(this.filteredRows);

  constructor() {
    this.search();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }

  search(): void {
    this.loading.set(true);
    this.billingService.getCancelledAdmissions(this.fromDateTime || undefined, this.toDateTime || undefined).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
        this.searched.set(true);
        this.pagination.reset();
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load cancelled admissions.');
      }
    });
  }

  viewDetails(row: CancelledAdmissionRow): void {
    this.router.navigate(['/ip/reports/cancelled-admissions', row.admissionId]);
  }
}
