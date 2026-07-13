import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CancelledBy } from './appointment.model';

export interface CancelAppointmentDialogData {
  patientName: string;
  /** Fixed when cancelling from the slot picker's Cancel-by-Hospital/Cancel-by-Patient buttons; omitted (user picks) from the general Appointments list. */
  cancelledBy?: CancelledBy;
}

export interface CancelAppointmentDialogResult {
  reason: string;
  cancelledBy: CancelledBy;
}

const CANCELLED_BY_LABEL: Record<CancelledBy, string> = {
  HOSPITAL: 'Hospital',
  PATIENT: 'Patient'
};

@Component({
  selector: 'app-cancel-appointment-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './cancel-appointment-dialog.component.html',
  styleUrl: './cancel-appointment-dialog.component.scss'
})
export class CancelAppointmentDialogComponent {
  private readonly dialogRef =
    inject(MatDialogRef<CancelAppointmentDialogComponent, CancelAppointmentDialogResult>);
  readonly data = inject<CancelAppointmentDialogData>(MAT_DIALOG_DATA);

  readonly fixedCancelledBy = this.data.cancelledBy ?? null;
  readonly cancelledByLabel = CANCELLED_BY_LABEL;

  reason = '';
  cancelledBy: CancelledBy = this.data.cancelledBy ?? 'HOSPITAL';

  get isValid(): boolean {
    return this.reason.trim().length > 0;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({ reason: this.reason.trim(), cancelledBy: this.cancelledBy });
  }
}
