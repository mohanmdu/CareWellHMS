import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Patient } from './patient.model';
import { PatientInput } from './patient.service';

export interface PatientFormDialogData {
  patient?: Patient;
}

/**
 * Add/Edit dialog for the Patient Registration grid. All fields are
 * mandatory (name, gender, age, 10-digit mobile number, location) - kept as
 * a dedicated dialog rather than the generic PromptDialog since it needs
 * typed dropdowns and a mobile-number input mask that the generic
 * text/number/textarea prompt fields don't support.
 */
@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './patient-form-dialog.component.html',
  styleUrl: './patient-form-dialog.component.scss'
})
export class PatientFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PatientFormDialogComponent, PatientInput>);
  private readonly data = inject<PatientFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.patient;
  readonly ages = Array.from({ length: 100 }, (_, i) => i + 1);

  form = {
    firstName: this.data.patient?.firstName ?? '',
    gender: this.data.patient?.gender ?? '',
    age: this.data.patient?.age ?? null,
    mobileNumber: this.data.patient?.mobileNumber ?? '',
    address: this.data.patient?.address ?? ''
  };

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.mobileNumber = input.value.replace(/\D/g, '').slice(0, 10);
  }

  get isValid(): boolean {
    return (
      this.form.firstName.trim().length > 0 &&
      !!this.form.gender &&
      !!this.form.age &&
      /^\d{10}$/.test(this.form.mobileNumber) &&
      this.form.address.trim().length > 0
    );
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({
      firstName: this.form.firstName.trim(),
      gender: this.form.gender,
      age: this.form.age,
      mobileNumber: this.form.mobileNumber,
      address: this.form.address.trim()
    });
  }
}
