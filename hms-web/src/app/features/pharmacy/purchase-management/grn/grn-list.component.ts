import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { GrnViewDialogComponent } from './grn-view-dialog.component';
import { GrnListEntry } from './grn.model';
import { GrnService } from './grn.service';

/**
 * GRN Report - approved GRNs only, read-only except for Delete. Invoice No
 * opens GrnViewDialogComponent (reopens GrnFormComponent readonly). Delete
 * is only permitted server-side while none of the GRN's credited stock has
 * moved since receipt (see GrnService.delete) - deleting reverses the
 * receipt entirely.
 */
@Component({
  selector: 'app-grn-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, EmptyStateComponent],
  templateUrl: './grn-list.component.html',
  styleUrl: './grn-list.component.scss'
})
export class GrnListComponent {
  private readonly service = inject(GrnService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly displayedColumns = [
    'supplierName',
    'invoiceNo',
    'invoiceDate',
    'netAmount',
    'sgstAmount',
    'cgstAmount',
    'invoiceAmount',
    'grnDate',
    'grnAmount',
    'createdBy',
    'createdAt',
    'delete'
  ];

  entries = signal<GrnListEntry[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list('APPROVED').subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load GRN Report.');
      }
    });
  }

  view(entry: GrnListEntry): void {
    this.dialog.open(GrnViewDialogComponent, { width: '960px', maxWidth: '95vw', data: { grnId: entry.id } });
  }

  delete(entry: GrnListEntry): void {
    this.confirmDialog
      .confirm({
        title: `Delete GRN for Invoice ${entry.invoiceNo}?`,
        message: `This undoes the receipt entirely, including the stock it credited. Only allowed if that stock hasn't moved since receipt. This cannot be undone.`,
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.delete(entry.id).subscribe({
          next: () => {
            this.notification.success('GRN deleted.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to delete GRN.')
        });
      });
  }
}
