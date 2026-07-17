import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IpBillingCategory } from '../ip-billing-categories/ip-billing-category.model';
import { IpBillingComponent } from './ip-billing-component.model';
import { IpBillingComponentInput } from './ip-billing-component.service';

export interface IpBillingComponentFormDialogData {
  categories: IpBillingCategory[];
  component?: IpBillingComponent;
}

@Component({
  selector: 'app-ip-billing-component-form-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './ip-billing-component-form-dialog.component.html',
  styleUrl: './ip-billing-component-form-dialog.component.scss'
})
export class IpBillingComponentFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<IpBillingComponentFormDialogComponent, IpBillingComponentInput>);
  private readonly data = inject<IpBillingComponentFormDialogData>(MAT_DIALOG_DATA);

  readonly categories = this.data.categories;
  readonly isEdit = !!this.data.component;

  form: IpBillingComponentInput = {
    categoryId: this.data.component?.categoryId ?? this.categories[0]?.id ?? 0,
    name: this.data.component?.name ?? '',
    ipAmount: this.data.component?.ipAmount ?? 0,
    insuranceAmount: this.data.component?.insuranceAmount ?? 0
  };

  get isValid(): boolean {
    return !!this.form.categoryId && !!this.form.name.trim() && this.form.ipAmount >= 0 && this.form.insuranceAmount >= 0;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({ ...this.form, name: this.form.name.trim() });
  }
}
