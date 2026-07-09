import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  PromptDialogComponent,
  PromptDialogData,
  PromptDialogValues
} from '../ui/prompt-dialog/prompt-dialog.component';

@Injectable({ providedIn: 'root' })
export class PromptDialogService {
  private readonly dialog = inject(MatDialog);

  /** Resolves to the entered field values, or `undefined` if dismissed. */
  prompt(data: PromptDialogData): Observable<PromptDialogValues | undefined> {
    return this.dialog.open(PromptDialogComponent, { data, width: '460px', autoFocus: 'dialog' }).afterClosed();
  }
}
