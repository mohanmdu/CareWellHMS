import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IcdCode, IcdCodeInput, ICD_VERSIONS, IcdVersion } from './icd.model';

export interface IcdCodeFormDialogData {
  icdCode?: IcdCode;
}

/** Add/Edit dialog for the ICD Code Master grid, mirroring ConsultantFormDialogComponent's shape. */
@Component({
  selector: 'app-icd-code-form-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './icd-code-form-dialog.component.html',
  styleUrl: './icd-code-form-dialog.component.scss'
})
export class IcdCodeFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<IcdCodeFormDialogComponent, IcdCodeInput>);
  private readonly data = inject<IcdCodeFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.icdCode;
  readonly icdVersions = ICD_VERSIONS;

  form = {
    version: this.data.icdCode?.version ?? ('ICD_10' as IcdVersion),
    code: this.data.icdCode?.code ?? '',
    diseaseName: this.data.icdCode?.diseaseName ?? '',
    chapter: this.data.icdCode?.chapter ?? '',
    category: this.data.icdCode?.category ?? '',
    whoVersion: this.data.icdCode?.whoVersion ?? '',
    shortDescription: this.data.icdCode?.shortDescription ?? ''
  };

  get isValid(): boolean {
    return this.form.code.trim().length > 0 && this.form.diseaseName.trim().length > 0;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close({
      version: this.form.version,
      code: this.form.code.trim(),
      diseaseName: this.form.diseaseName.trim(),
      chapter: this.form.chapter.trim() || null,
      category: this.form.category.trim() || null,
      whoVersion: this.form.whoVersion.trim() || null,
      shortDescription: this.form.shortDescription.trim() || null
    });
  }
}
