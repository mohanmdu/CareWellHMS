import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { Appointment } from './appointment.model';
import { AppointmentService } from './appointment.service';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  BOOKED: 'warning',
  CONFIRMED: 'info',
  CANCELLED: 'danger',
  COMPLETED: 'success'
};

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent {
  private readonly service = inject(AppointmentService);
  private readonly notification = inject(NotificationService);
  private readonly promptDialog = inject(PromptDialogService);

  readonly displayedColumns = ['patient', 'consultant', 'department', 'date', 'time', 'status', 'actions'];
  readonly statusTone = STATUS_TONE;

  appointments = signal<Appointment[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load appointments.');
      }
    });
  }

  confirm(appointment: Appointment): void {
    if (appointment.id === null) {
      return;
    }
    this.service.confirm(appointment.id).subscribe({
      next: () => {
        this.notification.success('Appointment confirmed.');
        this.refresh();
      },
      error: () => this.notification.error('Failed to confirm appointment.')
    });
  }

  cancel(appointment: Appointment): void {
    if (appointment.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: 'Cancel appointment',
        fields: [{ key: 'reason', label: 'Cancellation reason', type: 'textarea', required: true }],
        confirmLabel: 'Cancel appointment',
        destructive: true
      })
      .subscribe((values) => {
        if (!values || appointment.id === null) {
          return;
        }
        this.service.cancel(appointment.id, values['reason'] as string).subscribe({
          next: () => {
            this.notification.success('Appointment cancelled.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to cancel appointment.')
        });
      });
  }
}
