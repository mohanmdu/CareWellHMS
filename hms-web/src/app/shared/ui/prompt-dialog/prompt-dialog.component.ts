import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PromptDialogField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea';
  initialValue?: string | number;
  required?: boolean;
  min?: number;
}

export interface PromptDialogData {
  title: string;
  message?: string;
  fields: PromptDialogField[];
  confirmLabel?: string;
  destructive?: boolean;
}

export type PromptDialogValues = Record<string, string | number>;

/**
 * Generic single/multi-field input dialog. Replaces every remaining
 * `prompt()` call in the app (cancellation/rejection reasons, approved
 * amounts, discharge figures, lab result entry) with one accessible,
 * focus-trapped Material dialog instead of a bespoke dialog per screen -
 * see PromptDialogService for the call site pattern.
 */
@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './prompt-dialog.component.html',
  styleUrl: './prompt-dialog.component.scss'
})
export class PromptDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PromptDialogComponent, PromptDialogValues>);
  readonly data = inject<PromptDialogData>(MAT_DIALOG_DATA);

  readonly values: PromptDialogValues = {};

  constructor() {
    for (const field of this.data.fields) {
      this.values[field.key] = field.initialValue ?? (field.type === 'number' ? 0 : '');
    }
  }

  get isValid(): boolean {
    return this.data.fields.every((field) => {
      if (!field.required) {
        return true;
      }
      const value = this.values[field.key];
      return field.type === 'number' ? value !== null && value !== undefined : String(value ?? '').trim().length > 0;
    });
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    const trimmed: PromptDialogValues = {};
    for (const field of this.data.fields) {
      const value = this.values[field.key];
      trimmed[field.key] = field.type === 'number' ? Number(value) : String(value).trim();
    }
    this.dialogRef.close(trimmed);
  }
}
