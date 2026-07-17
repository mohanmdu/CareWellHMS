import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Patient } from '../../registration/patients/patient.model';

/**
 * Casualty/Emergency Admission entry point (PDF p.2): search an existing
 * patient by UHID/name/mobile (reuses the shared PatientSearchComponent
 * used across invoicing/lab/appointments - not forked), or register a new
 * one via the existing Patient Registration screen. The "Patient IP Request
 * From Consultant" table is shown empty/static - nothing in this app creates
 * entries there today, so it isn't fabricated with fake data.
 */
@Component({
  selector: 'app-admission-patient-search',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    PatientSearchComponent,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './admission-patient-search.component.html',
  styleUrl: './admission-patient-search.component.scss'
})
export class AdmissionPatientSearchComponent {
  private readonly router = inject(Router);

  readonly requestColumns = ['patientId', 'patientName', 'mobile', 'address', 'view', 'cancel'];

  selectPatient(patient: Patient): void {
    if (patient.id === null) {
      return;
    }
    this.router.navigate(['/ip/admissions/new', patient.id, 'register']);
  }

  newPatient(): void {
    this.router.navigate(['/registration/patients']);
  }
}
