import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { GrnViewDialogComponent } from './grn-view-dialog.component';
import { GrnListEntry } from './grn.model';
import { GrnService } from './grn.service';

/** GRN Report - approved GRNs only, read-only. View reopens GrnFormComponent in readonly mode inside a dialog. */
@Component({
  selector: 'app-grn-list',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatProgressBarModule, MatTableModule, EmptyStateComponent],
  templateUrl: './grn-list.component.html',
  styleUrl: './grn-list.component.scss'
})
export class GrnListComponent {
  private readonly service = inject(GrnService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['supplierName', 'invoiceNo', 'grnDate', 'grnAmount', 'status', 'actions'];

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
}
