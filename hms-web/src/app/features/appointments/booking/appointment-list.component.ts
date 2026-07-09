import { Component, inject, signal } from '@angular/core';
import { Appointment } from './appointment.model';
import { AppointmentService } from './appointment.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  templateUrl: './appointment-list.component.html'
})
export class AppointmentListComponent {
  private readonly service = inject(AppointmentService);

  appointments = signal<Appointment[]>([]);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (appointments) => this.appointments.set(appointments),
      error: () => this.errorMessage.set('Failed to load appointments.')
    });
  }

  confirm(appointment: Appointment): void {
    if (appointment.id === null) {
      return;
    }
    this.service.confirm(appointment.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to confirm appointment.')
    });
  }

  cancel(appointment: Appointment): void {
    if (appointment.id === null) {
      return;
    }
    const reason = prompt('Cancellation reason?') ?? '';
    this.service.cancel(appointment.id, reason).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to cancel appointment.')
    });
  }
}
