import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OpBillingCategory } from '../op-billing-categories/op-billing-category.model';
import { OpBillingComponent } from './op-billing-component.model';
import { OpBillingComponentInput } from './op-billing-component.service';

export interface OpBillingComponentFormDialogData {
  categories: OpBillingCategory[];
  component?: OpBillingComponent;
}

@Component({
  selector: 'app-op-billing-component-form-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './op-billing-component-form-dialog.component.html',
  styleUrl: './op-billing-component-form-dialog.component.scss'
})
export class OpBillingComponentFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<OpBillingComponentFormDialogComponent, OpBillingComponentInput>);
  private readonly data = inject<OpBillingComponentFormDialogData>(MAT_DIALOG_DATA);

  readonly categories = this.data.categories;
  readonly isEdit = !!this.data.component;

  form: OpBillingComponentInput = {
    categoryId: this.data.component?.categoryId ?? this.categories[0]?.id ?? 0,
    name: this.data.component?.name ?? '',
    amount: this.data.component?.amount ?? 0
  };

  get isValid(): boolean {
    return !!this.form.categoryId && !!this.form.name.trim() && this.form.amount > 0;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({ ...this.form, name: this.form.name.trim() });
  }
}
