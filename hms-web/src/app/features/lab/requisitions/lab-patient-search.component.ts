import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';

/**
 * Lab/Investigations patient search (screen 1 of 6). "Investigations" isn't
 * a separately built flow yet - both buttons run the same patient search and
 * lead into the same Lab Requisition workflow, since only Lab was specified.
 */
@Component({
  selector: 'app-lab-patient-search',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './lab-patient-search.component.html',
  styleUrl: './lab-patient-search.component.scss'
})
export class LabPatientSearchComponent {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  searchQuery = '';
  loading = signal(false);
  searched = signal(false);
  results = signal<Patient[]>([]);

  search(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      return;
    }
    this.loading.set(true);
    this.patientService.search(query).subscribe({
      next: (patients) => {
        this.results.set(patients);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Patient search failed.');
      }
    });
  }

  selectPatient(patient: Patient): void {
    if (patient.id === null) {
      return;
    }
    this.router.navigate(['/lab/requisitions/new', patient.id]);
  }
}
