import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';
import { Patient } from '../registration/patients/patient.model';
import { PatientService } from '../registration/patients/patient.service';

/**
 * View Uploaded Files (screen 1 of 2): find a patient by Name/Mobile or by
 * typing their UHID directly, then "Get Files" routes to their file list.
 * Occupation always shows "—" - Patient has no such field in this schema.
 */
@Component({
  selector: 'app-view-uploaded-files',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  templateUrl: './view-uploaded-files.component.html',
  styleUrl: './view-uploaded-files.component.scss'
})
export class ViewUploadedFilesComponent {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly patientIdSearchTerms = new Subject<string>();

  loading = signal(true);
  patients = signal<Patient[]>([]);

  nameOrMobileQuery = '';
  patientIdInput = signal('');
  selectedPatient = signal<Patient | null>(null);

  constructor() {
    this.loadPatients('');

    this.patientIdSearchTerms
      .pipe(debounceTime(300), distinctUntilChanged(), switchMap((query) => this.patientService.search(query)), takeUntilDestroyed())
      .subscribe((results) => {
        const typed = this.patientIdInput().trim().toLowerCase();
        const match = results.find((p) => p.registrationNumber?.toLowerCase() === typed);
        this.selectedPatient.set(match ?? null);
      });
  }

  private loadPatients(query: string): void {
    this.loading.set(true);
    this.patientService.search(query).subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load patients.');
      }
    });
  }

  search(): void {
    this.loadPatients(this.nameOrMobileQuery.trim());
  }

  onPatientIdChange(value: string): void {
    this.patientIdInput.set(value);
    this.selectedPatient.set(null);
    if (value.trim().length >= 1) {
      this.patientIdSearchTerms.next(value.trim());
    }
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.patientIdInput.set(patient.registrationNumber ?? '');
  }

  getFiles(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null) {
      this.notification.error('Enter a correct Patient UHID or select a patient from the list below.');
      return;
    }
    this.router.navigate(['/patient-reports/view', patient.id]);
  }
}
