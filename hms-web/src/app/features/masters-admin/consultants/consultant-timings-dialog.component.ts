import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConsultantAvailabilityFormComponent } from './consultant-availability-form.component';
import { ConsultantAvailability } from './consultant-timing.model';
import { ConsultantService } from './consultant.service';

export interface ConsultantTimingsDialogData {
  consultantId: number;
  consultantName: string;
}

/**
 * "Update Timings" dialog - a consultant's weekly working hours, using the
 * shared availability grid also embedded inline on the Add/Edit Consultant
 * form. Save replaces the whole week, matching the backend's replace-all
 * endpoint.
 */
@Component({
  selector: 'app-consultant-timings-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatProgressBarModule, ConsultantAvailabilityFormComponent],
  templateUrl: './consultant-timings-dialog.component.html',
  styleUrl: './consultant-timings-dialog.component.scss'
})
export class ConsultantTimingsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConsultantTimingsDialogComponent, boolean>);
  private readonly data = inject<ConsultantTimingsDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(ConsultantService);
  private readonly notification = inject(NotificationService);

  @ViewChild(ConsultantAvailabilityFormComponent) availabilityForm?: ConsultantAvailabilityFormComponent;

  readonly consultantName = this.data.consultantName;

  loading = signal(true);
  saving = signal(false);
  initialAvailability = signal<ConsultantAvailability | null>(null);

  constructor() {
    this.service.getAvailability(this.data.consultantId).subscribe({
      next: (availability) => {
        this.initialAvailability.set(availability);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load timings.');
      }
    });
  }

  save(): void {
    const form = this.availabilityForm;
    if (!form || !form.isValid) {
      return;
    }
    this.saving.set(true);
    this.service.saveAvailability(this.data.consultantId, form.getValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to save timings.');
      }
    });
  }
}
