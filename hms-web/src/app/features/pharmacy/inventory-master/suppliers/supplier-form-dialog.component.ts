import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Supplier } from './supplier.model';
import { SupplierInput } from './supplier.service';

export interface SupplierFormDialogData {
  supplier?: Supplier;
}

@Component({
  selector: 'app-supplier-form-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './supplier-form-dialog.component.html',
  styleUrl: './supplier-form-dialog.component.scss'
})
export class SupplierFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SupplierFormDialogComponent, SupplierInput>);
  private readonly data = inject<SupplierFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.supplier;

  form: SupplierInput = {
    name: this.data.supplier?.name ?? '',
    contactPersonName: this.data.supplier?.contactPersonName ?? null,
    mobileNumber: this.data.supplier?.mobileNumber ?? '',
    address: this.data.supplier?.address ?? '',
    city: this.data.supplier?.city ?? null,
    landlineNumber: this.data.supplier?.landlineNumber ?? null
  };

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.mobileNumber = input.value.replace(/\D/g, '').slice(0, 10);
  }

  get isValid(): boolean {
    return !!this.form.name.trim() && /^\d{10}$/.test(this.form.mobileNumber) && !!this.form.address.trim();
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({
      ...this.form,
      name: this.form.name.trim(),
      address: this.form.address.trim()
    });
  }
}
