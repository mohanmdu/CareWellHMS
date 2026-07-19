import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { TablePagination } from '../../shared/table/table-pagination';
import { PatientVisitSummary } from './icd.model';
import { PatientVisitSummaryService } from './patient-visit-summary.service';

/**
 * ICD Code Search (screen 1 of 3): a single Patient Name/Mobile/UHID search
 * box backed by PatientVisitSummaryService, whose result table's Select
 * Patient action populates the info panel below and unlocks Manage ICD
 * Codes, which routes to /icd/patients/:id.
 */
@Component({
  selector: 'app-icd-patient-search',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    EmptyStateComponent
  ],
  templateUrl: './icd-patient-search.component.html',
  styleUrl: './icd-patient-search.component.scss'
})
export class IcdPatientSearchComponent {
  private readonly visitSummaryService = inject(PatientVisitSummaryService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  searchQuery = '';
  loading = signal(false);
  searched = signal(false);
  results = signal<PatientVisitSummary[]>([]);
  selectedPatient = signal<PatientVisitSummary | null>(null);

  readonly pagination = new TablePagination(this.results);

  search(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      return;
    }
    this.loading.set(true);
    this.selectedPatient.set(null);
    this.visitSummaryService.search(query).subscribe({
      next: (rows) => {
        this.results.set(rows);
        this.pagination.reset();
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Patient search failed.');
      }
    });
  }

  selectPatient(patient: PatientVisitSummary): void {
    this.selectedPatient.set(patient);
  }

  manageIcdCodes(): void {
    const patient = this.selectedPatient();
    if (!patient) {
      return;
    }
    this.router.navigate(['/icd/patients', patient.patientId]);
  }
}
