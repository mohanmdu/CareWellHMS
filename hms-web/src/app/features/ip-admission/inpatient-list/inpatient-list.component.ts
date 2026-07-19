import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { Admission } from '../admissions/admission.model';
import { AdmissionService } from '../admissions/admission.service';
import { InpatientCardComponent } from './inpatient-card.component';

type ViewBy = 'LIST' | 'WARD' | 'CONSULTANT';

interface PatientGroup {
  label: string;
  admissions: Admission[];
}

/**
 * Inpatient List (PDF p.10): the active-census view of currently ADMITTED
 * patients, grouped by List/Ward/Consultant - distinct from the IP Admissions
 * worklist, which manages the REGISTERED/ADMITTED/DISCHARGED status lifecycle
 * itself. ICD Code has no data source anywhere in this system yet (the
 * reference screen itself shows it blank for every row), so it's rendered
 * as a label with no value rather than inventing a new field.
 */
@Component({
  selector: 'app-inpatient-list',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent,
    TableSearchComponent,
    InpatientCardComponent
  ],
  templateUrl: './inpatient-list.component.html',
  styleUrl: './inpatient-list.component.scss'
})
export class InpatientListComponent {
  private readonly admissionService = inject(AdmissionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  loading = signal(true);
  allAdmissions = signal<Admission[]>([]);

  searchTerm = signal('');
  viewBy = signal<ViewBy>('LIST');

  totalPatients = computed(() => this.allAdmissions().length);
  admittedCount = computed(() => this.allAdmissions().filter((a) => a.status === 'ADMITTED').length);
  dischargedCount = computed(() => this.allAdmissions().filter((a) => a.status === 'DISCHARGED').length);

  private admittedPatients = computed(() => this.allAdmissions().filter((a) => a.status === 'ADMITTED'));

  filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.admittedPatients();
    if (!term) {
      return list;
    }
    return list.filter(
      (a) =>
        (a.patientName ?? '').toLowerCase().includes(term) ||
        (a.admissionNumber ?? '').toLowerCase().includes(term) ||
        (a.patientUhid ?? '').toLowerCase().includes(term)
    );
  });

  pagination = new TablePagination(this.filteredPatients);

  groups = computed<PatientGroup[]>(() => {
    const view = this.viewBy();
    const list = this.filteredPatients();
    if (view === 'LIST') {
      return [];
    }
    const keyOf = (a: Admission) => (view === 'WARD' ? (a.roomTypeName ?? 'Unassigned Ward') : (a.primaryConsultant ?? 'Unassigned Consultant'));
    const byKey = new Map<string, Admission[]>();
    for (const admission of list) {
      const key = keyOf(admission);
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.push(admission);
      } else {
        byKey.set(key, [admission]);
      }
    }
    return [...byKey.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, admissions]) => ({ label, admissions }));
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.admissionService.list().subscribe({
      next: (admissions) => {
        this.allAdmissions.set(admissions);
        this.pagination.reset();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the inpatient list.');
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }

  onViewByChange(view: ViewBy): void {
    this.viewBy.set(view);
  }

  initials(admission: Admission): string {
    return (admission.patientName ?? '?').trim().charAt(0).toUpperCase();
  }

  wardChange(admission: Admission): void {
    if (admission.id === null) {
      return;
    }
    this.router.navigate(['/ip/admissions', admission.id, 'ward-change']);
  }

  exportCsv(): void {
    const rows = this.filteredPatients();
    const header = ['UHID', 'IPID', 'Patient Name', 'Gender', 'Age', 'DOA', 'Payment Type', 'Location', 'Consultant', 'Ref By', 'Advance Amount'];
    const lines = [header.join(',')];
    for (const a of rows) {
      const location = a.roomTypeName && a.roomNumber ? `${a.roomTypeName} - ${a.roomNumber}` : '';
      lines.push(
        [
          a.patientUhid ?? '',
          a.admissionNumber ?? '',
          a.patientName ?? '',
          a.patientGender ?? '',
          a.patientAge ?? '',
          a.admissionDate ?? '',
          a.paymentType ?? '',
          location,
          a.primaryConsultant ?? '',
          a.referralDoctor ?? '',
          a.advanceAmount ?? 0
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inpatient-list.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
