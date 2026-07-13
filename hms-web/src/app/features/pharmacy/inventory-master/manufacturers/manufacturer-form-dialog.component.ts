import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Manufacturer } from './manufacturer.model';
import { ManufacturerInput } from './manufacturer.service';

export interface ManufacturerFormDialogData {
  manufacturer?: Manufacturer;
}

@Component({
  selector: 'app-manufacturer-form-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './manufacturer-form-dialog.component.html',
  styleUrl: './manufacturer-form-dialog.component.scss'
})
export class ManufacturerFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ManufacturerFormDialogComponent, ManufacturerInput>);
  private readonly data = inject<ManufacturerFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.manufacturer;

  form: ManufacturerInput = {
    name: this.data.manufacturer?.name ?? '',
    contactPersonName: this.data.manufacturer?.contactPersonName ?? null,
    phoneNumber: this.data.manufacturer?.phoneNumber ?? null,
    address: this.data.manufacturer?.address ?? '',
    city: this.data.manufacturer?.city ?? '',
    state: this.data.manufacturer?.state ?? ''
  };

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.phoneNumber = input.value.replace(/\D/g, '').slice(0, 10);
  }

  get isValid(): boolean {
    if (this.form.phoneNumber && !/^\d{10}$/.test(this.form.phoneNumber)) {
      return false;
    }
    return (
      !!this.form.name.trim() && !!this.form.address.trim() && !!this.form.city.trim() && !!this.form.state.trim()
    );
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({
      ...this.form,
      name: this.form.name.trim(),
      address: this.form.address.trim(),
      city: this.form.city.trim(),
      state: this.form.state.trim()
    });
  }
}
