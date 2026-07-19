import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { DischargeInitiatedRow } from './discharge-summary.model';
import { DischargeSummaryService } from './discharge-summary.service';

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
 * Discharge Initiated List: card-based worklist of admissions whose
 * discharge has been initiated (stage 1) but not yet finalized. "Discharge
 * Summary" routes straight to the read-only print sheet (reusing
 * DischargeSummaryPrintComponent, which already renders an empty-shell
 * summary gracefully if none has been drafted yet) rather than a separate
 * screen, matching the reference's direct list -> print-sheet transition.
 */
@Component({
  selector: 'app-discharge-initiated-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './discharge-initiated-list.component.html',
  styleUrl: './discharge-initiated-list.component.scss'
})
export class DischargeInitiatedListComponent {
  private readonly service = inject(DischargeSummaryService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  rows = signal<DischargeInitiatedRow[]>([]);
  loading = signal(false);
  searched = signal(false);
  searchTerm = signal('');

  fromDate: Date | null = null;
  toDate: Date | null = null;

  filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.rows();
    }
    return this.rows().filter(
      (row) =>
        row.patientName.toLowerCase().includes(term) ||
        (row.patientUhid ?? '').toLowerCase().includes(term) ||
        row.admissionNumber.toLowerCase().includes(term)
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

  onPageSizeChange(size: number): void {
    this.pagination.pageSize.set(size);
    this.pagination.reset();
  }

  search(): void {
    this.loading.set(true);
    this.service.initiatedList(toIsoDate(this.fromDate), toIsoDate(this.toDate)).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.pagination.reset();
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the discharge initiated list.');
      }
    });
  }

  gotoBilling(row: DischargeInitiatedRow): void {
    this.router.navigate(['/ip/admissions', row.admissionId, 'billing']);
  }

  gotoDischargeSummary(row: DischargeInitiatedRow): void {
    this.router.navigate(['/ip/discharge-summary', row.admissionId, 'print']);
  }
}
