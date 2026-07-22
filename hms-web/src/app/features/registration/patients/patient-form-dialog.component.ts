import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PATIENT_ORIGIN_MODULE_OPTIONS, Patient, PatientOriginModule } from './patient.model';
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
 *
 * Age is a type-or-pick combobox (mat-autocomplete over an editable input),
 * not a closed mat-select - staff can type the age directly or open the
 * panel and choose from 1-100.
 */
@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule
  ],
  templateUrl: './patient-form-dialog.component.html',
  styleUrl: './patient-form-dialog.component.scss'
})
export class PatientFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PatientFormDialogComponent, PatientInput>);
  private readonly data = inject<PatientFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.patient;
  readonly ageOptions = Array.from({ length: 100 }, (_, i) => i + 1);
  readonly originModuleOptions = PATIENT_ORIGIN_MODULE_OPTIONS;
  filteredAgeOptions = signal<number[]>(this.ageOptions);

  ageInput = this.data.patient?.age != null ? String(this.data.patient.age) : '';

  form = {
    firstName: this.data.patient?.firstName ?? '',
    gender: this.data.patient?.gender ?? '',
    age: this.data.patient?.age ?? (null as number | null),
    mobileNumber: this.data.patient?.mobileNumber ?? '',
    address: this.data.patient?.address ?? '',
    originModule: null as PatientOriginModule | null
  };

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.mobileNumber = input.value.replace(/\D/g, '').slice(0, 10);
  }

  onAgeInput(event: Event): void {
    const digitsOnly = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 3);
    this.ageInput = digitsOnly;
    const value = Number(digitsOnly);
    this.form.age = digitsOnly && value >= 1 && value <= 100 ? value : null;
    this.filteredAgeOptions.set(
      digitsOnly ? this.ageOptions.filter((age) => String(age).startsWith(digitsOnly)) : this.ageOptions
    );
  }

  onAgeOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const age = event.option.value as number;
    this.form.age = age;
    this.ageInput = String(age);
    this.filteredAgeOptions.set(this.ageOptions);
  }

  get isValid(): boolean {
    return (
      this.form.firstName.trim().length > 0 &&
      !!this.form.gender &&
      !!this.form.age &&
      /^\d{10}$/.test(this.form.mobileNumber) &&
      this.form.address.trim().length > 0 &&
      (this.isEdit || !!this.form.originModule)
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
      address: this.form.address.trim(),
      ...(this.isEdit ? {} : { originModule: this.form.originModule })
    });
  }
}
