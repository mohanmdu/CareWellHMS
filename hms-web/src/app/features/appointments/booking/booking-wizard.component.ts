import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
import { AppointmentService } from './appointment.service';

/**
 * Replaces the legacy multi-JSP appointment wizard (Appointments/0X_*.jsp,
 * migration doc §4.1) with one Angular stepper backed by stateless REST
 * calls instead of the legacy session-scoped adminBean carrying state
 * across requests (migration doc §5, risk R2). Genuinely sequential/gated
 * steps (patient must be picked before a slot, a slot before confirming),
 * so this is the one screen in the app that uses MatStepper rather than
 * the stacked-card layout used for line-item entry screens (§5.3).
 */
@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    PatientSearchComponent
  ],
  templateUrl: './booking-wizard.component.html',
  styleUrl: './booking-wizard.component.scss'
})
export class BookingWizardComponent {
  private readonly patientService = inject(PatientService);
  private readonly consultantService = inject(ConsultantService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  step = signal(1);

  // Step 1: find or register patient
  selectedPatient = signal<Patient | null>(null);
  showNewPatientForm = signal(false);
  newPatient = { firstName: '', lastName: '', mobileNumber: '', gender: '' };

  // Step 2: consultant + slot
  consultants = signal<Consultant[]>([]);
  selectedConsultantId: number | null = null;
  appointmentDate = '';
  slotTime = '';
  notes = '';

  readonly selectedConsultant = computed(
    () => this.consultants().find((c) => c.id === this.selectedConsultantId) ?? null
  );

  constructor() {
    this.consultantService.list().subscribe({
      next: (consultants) => this.consultants.set(consultants.filter((c) => c.active)),
      error: () => this.notification.error('Failed to load consultants.')
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.step.set(2);
  }

  changePatient(): void {
    this.selectedPatient.set(null);
    this.step.set(1);
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
      error: () => this.notification.error('Failed to register patient.')
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
          this.notification.success('Appointment booked successfully.');
          this.router.navigateByUrl('/appointments');
        },
        error: (err) => this.notification.error(err.error?.message ?? 'Failed to book appointment.')
      });
  }

  back(): void {
    this.step.update((s) => Math.max(1, s - 1));
  }
}
