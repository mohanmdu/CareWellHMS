import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GrnFormComponent } from './grn-form.component';

export interface GrnViewDialogData {
  grnId: number;
}

/** Thin dialog wrapper reopening GrnFormComponent in readonly mode to view a past GRN. */
@Component({
  selector: 'app-grn-view-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, GrnFormComponent],
  templateUrl: './grn-view-dialog.component.html',
  styleUrl: './grn-view-dialog.component.scss'
})
export class GrnViewDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<GrnViewDialogComponent>);
  private readonly data = inject<GrnViewDialogData>(MAT_DIALOG_DATA);

  readonly grnId = this.data.grnId;

  close(): void {
    this.dialogRef.close();
  }
}
