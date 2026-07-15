import { DecimalPipe } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { TableSearchComponent } from '../../../../shared/table/table-search.component';
import { GrnListEntry } from './grn.model';
import { GrnService } from './grn.service';

/** Draft GRNs - Edit reopens the Direct GRN tab pre-loaded for editing (see GrnTabComponent), Delete removes it outright. */
@Component({
  selector: 'app-draft-grn-list',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatProgressBarModule, MatTableModule, EmptyStateComponent, TableSearchComponent],
  templateUrl: './draft-grn-list.component.html',
  styleUrl: './draft-grn-list.component.scss'
})
export class DraftGrnListComponent {
  private readonly service = inject(GrnService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly edit = output<number>();

  readonly displayedColumns = ['supplierName', 'invoiceNo', 'grnDate', 'grnAmount', 'actions'];

  entries = signal<GrnListEntry[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list('DRAFT').subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load draft GRNs.');
      }
    });
  }

  filteredEntries(): GrnListEntry[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.entries();
    }
    return this.entries().filter(
      (entry) => entry.supplierName.toLowerCase().includes(term) || entry.invoiceNo.toLowerCase().includes(term)
    );
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  editDraft(entry: GrnListEntry): void {
    this.edit.emit(entry.id);
  }

  deleteDraft(entry: GrnListEntry): void {
    this.confirmDialog
      .confirm({
        title: `Delete this draft GRN?`,
        message: `The draft GRN for ${entry.supplierName} (Invoice ${entry.invoiceNo}) will be permanently deleted. This cannot be undone.`,
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.delete(entry.id).subscribe({
          next: () => {
            this.notification.success('Draft GRN deleted.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to delete draft GRN.')
        });
      });
  }
}
