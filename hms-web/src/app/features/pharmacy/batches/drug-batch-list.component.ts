import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Drug } from '../drugs/drug.model';
import { DrugService } from '../drugs/drug.service';
import { DrugBatch } from './drug-batch.model';
import { DrugBatchService } from './drug-batch.service';

/**
 * Simplified stand-in for the legacy GRN entry screens (ProductEntryForGrn,
 * addStockEntry - migration doc §4.3): receiving stock creates a batch
 * directly. A full procurement workflow would add a vendor/PO header first.
 * Batches are an append-only ledger (no deactivate concept), so no status
 * column/actions here.
 */
@Component({
  selector: 'app-drug-batch-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './drug-batch-list.component.html',
  styleUrl: './drug-batch-list.component.scss'
})
export class DrugBatchListComponent {
  private readonly service = inject(DrugBatchService);
  private readonly drugService = inject(DrugService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['drug', 'batch', 'expiry', 'quantity', 'purchasePrice', 'sellingPrice'];

  batches = signal<DrugBatch[]>([]);
  drugs = signal<Drug[]>([]);
  loading = signal(false);
  saving = signal(false);

  form = {
    drugId: null as number | null,
    batchNumber: '',
    expiryDate: '',
    quantityOnHand: 0,
    purchasePrice: 0,
    sellingPrice: 0
  };

  constructor() {
    this.refresh();
    this.drugService.list().subscribe({ next: (drugs) => this.drugs.set(drugs.filter((d) => d.active)) });
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (batches) => {
        this.batches.set(batches);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load stock batches.');
      }
    });
  }

  receiveStock(): void {
    if (!this.form.drugId || !this.form.batchNumber.trim() || !this.form.expiryDate) {
      return;
    }
    this.saving.set(true);
    this.service.receiveStock({ ...this.form, drugId: this.form.drugId }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form = { drugId: null, batchNumber: '', expiryDate: '', quantityOnHand: 0, purchasePrice: 0, sellingPrice: 0 };
        this.notification.success('Stock received.');
        this.refresh();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to receive stock.');
      }
    });
  }
}
