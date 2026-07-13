import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { DayOfWeek, Session, SESSIONS } from '../../masters-admin/consultants/consultant-timing.model';
import { Patient } from '../../registration/patients/patient.model';
import { Appointment, AppointmentSlot, CancelledBy, DailyAvailability } from './appointment.model';
import { AppointmentService } from './appointment.service';
import { CancelAppointmentDialogComponent, CancelAppointmentDialogResult } from './cancel-appointment-dialog.component';

const SHORT_DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun'
};

const SESSION_SHORT_LABELS: Record<Session, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  NIGHT: 'Night'
};

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/**
 * Doctor-first booking wizard (matches the legacy sequence): pick a
 * consultant, browse their weekly availability derived from ConsultantTiming
 * and pick a real generated slot, then identify the patient and confirm.
 * MatStepper already renders a numbered/labelled progress trail, so it
 * stands in for the "breadcrumb stepper" ask without a new UI primitive.
 */
@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent,
    PatientSearchComponent
  ],
  templateUrl: './booking-wizard.component.html',
  styleUrl: './booking-wizard.component.scss'
})
export class BookingWizardComponent {
  private readonly consultantService = inject(ConsultantService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly today = toIsoDate(new Date());
  readonly shortDayLabels = SHORT_DAY_LABELS;
  readonly sessionShortLabels = SESSION_SHORT_LABELS;
  readonly sessions = SESSIONS;

  step = signal(1);

  // Step 1: doctor
  consultants = signal<Consultant[]>([]);
  selectedConsultantId = signal<number | null>(null);
  readonly selectedConsultant = computed(
    () => this.consultants().find((c) => c.id === this.selectedConsultantId()) ?? null
  );

  // Step 2: weekly strip + slot
  weekOffset = signal(0);
  readonly weekDates = computed(() => {
    const start = addDays(this.today, this.weekOffset() * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  });
  summary = signal<DailyAvailability[]>([]);
  loadingSummary = signal(false);
  selectedDate = signal<string | null>(null);
  slots = signal<AppointmentSlot[]>([]);
  loadingSlots = signal(false);
  selectedTime = signal<string | null>(null);
  /** The selected slot's true calendar date - may differ from selectedDate() for a NIGHT slot past midnight. */
  selectedSlotDate = signal<string | null>(null);

  readonly slotsBySession = computed(() => {
    const bySession: Record<Session, AppointmentSlot[]> = { MORNING: [], AFTERNOON: [], EVENING: [], NIGHT: [] };
    for (const slot of this.slots()) {
      if (slot.status !== 'BOOKED') {
        bySession[slot.session].push(slot);
      }
    }
    return bySession;
  });
  readonly bookedSlots = computed(() => this.slots().filter((s) => s.status === 'BOOKED'));

  readonly summaryByDate = computed(() => {
    const map = new Map<string, DailyAvailability>();
    for (const day of this.summary()) {
      map.set(day.date, day);
    }
    return map;
  });

  // Step 3: patient (existing patients only - no new-patient registration here) + confirm
  selectedPatient = signal<Patient | null>(null);
  notes = '';
  booking = signal(false);
  bookedAppointment = signal<Appointment | null>(null);

  readonly whatsAppLink = computed(() => {
    const appointment = this.bookedAppointment();
    const patient = this.selectedPatient();
    if (!appointment || !patient?.mobileNumber) {
      return null;
    }
    const digits = patient.mobileNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hi ${patient.firstName}, your appointment with ${appointment.consultantName} is confirmed for ${appointment.appointmentDate} at ${appointment.slotTime}.`
    );
    return `https://wa.me/${digits}?text=${text}`;
  });

  constructor() {
    this.consultantService.list().subscribe({
      next: (consultants) => this.consultants.set(consultants.filter((c) => c.active && c.acceptingAppointments)),
      error: () => this.notification.error('Failed to load consultants.')
    });
  }

  sessionOf(day: DailyAvailability, session: Session) {
    return day.sessions.find((s) => s.session === session);
  }

  /**
   * Guards against skipping ahead via a step-header click without completing
   * prior steps. Not using MatStepper's own `linear` mode for this: its
   * guard reads each mat-step's `completed` input synchronously as part of
   * the same change-detection pass that also updates `selectedIndex`, so a
   * `completed` flag flipped in the same click handler that advances the
   * step can still read as stale and silently block the transition.
   */
  onStepIndexChange(index: number): void {
    if (index >= 1 && !this.selectedConsultantId()) {
      return;
    }
    if (index >= 2 && !this.selectedTime()) {
      return;
    }
    this.step.set(index + 1);
  }

  selectConsultant(consultant: Consultant): void {
    if (consultant.id === null) {
      return;
    }
    this.selectedConsultantId.set(consultant.id);
    this.weekOffset.set(0);
    this.selectedDate.set(null);
    this.slots.set([]);
    this.selectedTime.set(null);
    this.step.set(2);
    this.loadSummary();
  }

  changeWeek(delta: number): void {
    this.weekOffset.update((offset) => Math.max(0, offset + delta));
    this.selectedDate.set(null);
    this.slots.set([]);
    this.loadSummary();
  }

  private loadSummary(): void {
    const consultantId = this.selectedConsultantId();
    if (!consultantId) {
      return;
    }
    const dates = this.weekDates();
    this.loadingSummary.set(true);
    this.appointmentService.getAvailabilitySummary(consultantId, dates[0], dates[6]).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadingSummary.set(false);
      },
      error: () => {
        this.loadingSummary.set(false);
        this.notification.error('Failed to load availability.');
      }
    });
  }

  selectDay(date: string): void {
    const consultantId = this.selectedConsultantId();
    if (!consultantId) {
      return;
    }
    this.selectedDate.set(date);
    this.selectedTime.set(null);
    this.selectedSlotDate.set(null);
    this.loadingSlots.set(true);
    this.appointmentService.getSlots(consultantId, date).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.loadingSlots.set(false);
        this.notification.error('Failed to load time slots.');
      }
    });
  }

  selectSlot(slot: AppointmentSlot): void {
    if (slot.status !== 'AVAILABLE') {
      return;
    }
    this.selectedTime.set(slot.time);
    this.selectedSlotDate.set(slot.date);
    this.step.set(3);
  }

  cancelBookedSlot(slot: AppointmentSlot, cancelledBy?: CancelledBy): void {
    if (slot.appointmentId === null) {
      return;
    }
    this.dialog
      .open(CancelAppointmentDialogComponent, {
        width: '420px',
        data: { patientName: slot.patientName ?? 'this patient', cancelledBy }
      })
      .afterClosed()
      .subscribe((result?: CancelAppointmentDialogResult) => {
        if (!result || slot.appointmentId === null) {
          return;
        }
        this.appointmentService.cancel(slot.appointmentId, result.reason, result.cancelledBy).subscribe({
          next: () => {
            this.notification.success('Appointment cancelled.');
            this.loadSummary();
            const date = this.selectedDate();
            if (date) {
              this.selectDay(date);
            }
          },
          error: () => this.notification.error('Failed to cancel appointment.')
        });
      });
  }

  back(): void {
    this.step.update((s) => Math.max(1, s - 1));
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  changePatient(): void {
    this.selectedPatient.set(null);
  }

  confirmBooking(): void {
    const patient = this.selectedPatient();
    const consultantId = this.selectedConsultantId();
    const date = this.selectedSlotDate();
    const time = this.selectedTime();
    if (!patient || patient.id === null || !consultantId || !date || !time) {
      return;
    }
    this.booking.set(true);
    this.appointmentService
      .book({ patientId: patient.id, consultantId, appointmentDate: date, slotTime: time, notes: this.notes })
      .subscribe({
        next: (appointment) => {
          this.booking.set(false);
          this.bookedAppointment.set(appointment);
        },
        error: (err) => {
          this.booking.set(false);
          this.notification.error(err.error?.message ?? 'Failed to book appointment.');
        }
      });
  }

  bookAnother(): void {
    this.step.set(1);
    this.selectedConsultantId.set(null);
    this.weekOffset.set(0);
    this.selectedDate.set(null);
    this.slots.set([]);
    this.selectedTime.set(null);
    this.selectedSlotDate.set(null);
    this.selectedPatient.set(null);
    this.notes = '';
    this.bookedAppointment.set(null);
  }

  viewAppointments(): void {
    this.router.navigateByUrl('/appointments');
  }
}
