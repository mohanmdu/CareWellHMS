import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Manufacturer } from '../manufacturers/manufacturer.model';
import { ProductType } from '../product-types/product-type.model';
import { Rack } from '../racks/rack.model';
import {
  DRUG_SCHEDULE_TYPES,
  DRUG_SCHEDULE_TYPE_LABELS,
  MEDICAL_CATEGORIES,
  MEDICAL_CATEGORY_LABELS,
  Product
} from './product.model';
import { ProductInput } from './product.service';

export interface ProductFormDialogData {
  productTypes: ProductType[];
  racks: Rack[];
  manufacturers: Manufacturer[];
  product?: Product;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './product-form-dialog.component.html',
  styleUrl: './product-form-dialog.component.scss'
})
export class ProductFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent, ProductInput>);
  private readonly data = inject<ProductFormDialogData>(MAT_DIALOG_DATA);

  readonly productTypes = this.data.productTypes;
  readonly racks = this.data.racks;
  readonly manufacturers = this.data.manufacturers;
  readonly medicalCategories = MEDICAL_CATEGORIES;
  readonly medicalCategoryLabels = MEDICAL_CATEGORY_LABELS;
  readonly scheduleTypes = DRUG_SCHEDULE_TYPES;
  readonly scheduleTypeLabels = DRUG_SCHEDULE_TYPE_LABELS;
  readonly isEdit = !!this.data.product;

  form: ProductInput = {
    name: this.data.product?.name ?? '',
    productTypeId: this.data.product?.productTypeId ?? this.productTypes[0]?.id ?? 0,
    productCategory: this.data.product?.productCategory ?? null,
    drugDosage: this.data.product?.drugDosage ?? null,
    drugType: this.data.product?.drugType ?? null,
    rackId: this.data.product?.rackId ?? this.racks[0]?.id ?? 0,
    manufacturerId: this.data.product?.manufacturerId ?? null,
    medOrNonMed: this.data.product?.medOrNonMed ?? 'MEDICAL',
    centralGst: this.data.product?.centralGst ?? 0,
    stateGst: this.data.product?.stateGst ?? 0,
    hsnSac: this.data.product?.hsnSac ?? null,
    scheduleType: this.data.product?.scheduleType ?? 'NONE'
  };

  get isValid(): boolean {
    return !!this.form.name.trim() && !!this.form.productTypeId && !!this.form.rackId;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({ ...this.form, name: this.form.name.trim() });
  }
}
