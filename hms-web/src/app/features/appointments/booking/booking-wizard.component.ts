import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
import { AppointmentService } from './appointment.service';

/**
 * Replaces the legacy multi-JSP appointment wizard (Appointments/0X_*.jsp,
 * migration doc §4.1) with one Angular stepper backed by stateless REST
 * calls instead of the legacy session-scoped adminBean carrying state
 * across requests (migration doc §5, risk R2).
 */
@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './booking-wizard.component.html'
})
export class BookingWizardComponent {
  private readonly patientService = inject(PatientService);
  private readonly consultantService = inject(ConsultantService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  step = signal(1);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Step 1: find or register patient
  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  showNewPatientForm = signal(false);
  newPatient = { firstName: '', lastName: '', mobileNumber: '', gender: '' };

  // Step 2: consultant + slot
  consultants = signal<Consultant[]>([]);
  selectedConsultantId: number | null = null;
  appointmentDate = '';
  slotTime = '';
  notes = '';

  readonly selectedConsultant = computed(() =>
    this.consultants().find((c) => c.id === this.selectedConsultantId) ?? null
  );

  constructor() {
    this.consultantService.list().subscribe({
      next: (consultants) => this.consultants.set(consultants.filter((c) => c.active)),
      error: () => this.errorMessage.set('Failed to load consultants.')
    });
  }

  search(): void {
    this.patientService.search(this.searchQuery).subscribe({
      next: (patients) => this.searchResults.set(patients),
      error: () => this.errorMessage.set('Patient search failed.')
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.step.set(2);
  }

  registerNewPatient(): void {
    if (!this.newPatient.firstName.trim() || !this.newPatient.mobileNumber.trim()) {
      return;
    }
    this.patientService.register(this.newPatient).subscribe({
      next: (patient) => {
        this.selectedPatient.set(patient);
        this.showNewPatientForm.set(false);
        this.step.set(2);
      },
      error: () => this.errorMessage.set('Failed to register patient.')
    });
  }

  goToConfirm(): void {
    if (!this.selectedConsultantId || !this.appointmentDate || !this.slotTime) {
      return;
    }
    this.step.set(3);
  }

  book(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || !this.selectedConsultantId) {
      return;
    }
    this.errorMessage.set(null);
    this.appointmentService
      .book({
        patientId: patient.id,
        consultantId: this.selectedConsultantId,
        appointmentDate: this.appointmentDate,
        slotTime: this.slotTime,
        notes: this.notes
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Appointment booked successfully.');
          this.router.navigateByUrl('/appointments');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to book appointment.')
      });
  }

  back(): void {
    this.step.update((s) => Math.max(1, s - 1));
  }
}
