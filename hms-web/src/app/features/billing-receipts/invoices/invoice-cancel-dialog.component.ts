import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * Captures a cancellation/refund reason. Replaces the previous
 * `prompt('Cancellation/refund reason?')` call, which is inaccessible
 * (no focus trap/label) and blocks the render thread.
 */
@Component({
  selector: 'app-invoice-cancel-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './invoice-cancel-dialog.component.html',
  styleUrl: './invoice-cancel-dialog.component.scss'
})
export class InvoiceCancelDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<InvoiceCancelDialogComponent, string>);

  reason = '';

  submit(): void {
    const trimmed = this.reason.trim();
    if (!trimmed) {
      return;
    }
    this.dialogRef.close(trimmed);
  }
}
