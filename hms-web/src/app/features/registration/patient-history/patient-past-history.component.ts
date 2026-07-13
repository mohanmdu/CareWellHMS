import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { Appointment } from '../../appointments/booking/appointment.model';
import { AppointmentService } from '../../appointments/booking/appointment.service';
import { OpCaseSheetViewDialogComponent } from '../../appointments/prescriptions/op-case-sheet-view-dialog.component';
import { Patient } from '../patients/patient.model';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  BOOKED: 'warning',
  CONFIRMED: 'info',
  CANCELLED: 'danger',
  COMPLETED: 'success'
};

/**
 * Patient-centric visit history (migration doc's Patient Past History
 * module) - search-then-reveal, same pattern as OP Direct Billing/the
 * booking wizard's patient step. "View Details" reopens the already-built
 * OpCaseSheetViewDialogComponent, which already renders gracefully (an
 * empty shell) when an appointment has no case sheet yet.
 */
@Component({
  selector: 'app-patient-past-history',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    PatientSearchComponent
  ],
  templateUrl: './patient-past-history.component.html',
  styleUrl: './patient-past-history.component.scss'
})
export class PatientPastHistoryComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['appointmentDate', 'consultant', 'department', 'status', 'actions'];
  readonly statusTone = STATUS_TONE;

  patient = signal<Patient | null>(null);
  appointments = signal<Appointment[]>([]);
  loading = signal(false);

  selectPatient(patient: Patient): void {
    this.patient.set(patient);
    this.loadHistory(patient);
  }

  reset(): void {
    this.patient.set(null);
    this.appointments.set([]);
  }

  private loadHistory(patient: Patient): void {
    if (!patient.id) {
      return;
    }
    this.loading.set(true);
    this.appointmentService.list({ patientId: patient.id }).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load visit history.');
      }
    });
  }

  viewDetails(appointment: Appointment): void {
    if (appointment.id === null) {
      return;
    }
    this.dialog.open(OpCaseSheetViewDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { appointmentId: appointment.id }
    });
  }
}
