import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drug } from '../drugs/drug.model';
import { DrugService } from '../drugs/drug.service';
import { DrugBatch } from './drug-batch.model';
import { DrugBatchService } from './drug-batch.service';

/**
 * Simplified stand-in for the legacy GRN entry screens (ProductEntryForGrn,
 * addStockEntry - migration doc §4.3): receiving stock creates a batch
 * directly. A full procurement workflow would add a vendor/PO header first.
 */
@Component({
  selector: 'app-drug-batch-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './drug-batch-list.component.html'
})
export class DrugBatchListComponent {
  private readonly service = inject(DrugBatchService);
  private readonly drugService = inject(DrugService);

  batches = signal<DrugBatch[]>([]);
  drugs = signal<Drug[]>([]);
  errorMessage = signal<string | null>(null);

  form = { drugId: null as number | null, batchNumber: '', expiryDate: '', quantityOnHand: 0, purchasePrice: 0, sellingPrice: 0 };

  constructor() {
    this.refresh();
    this.drugService.list().subscribe({ next: (drugs) => this.drugs.set(drugs.filter((d) => d.active)) });
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (batches) => this.batches.set(batches),
      error: () => this.errorMessage.set('Failed to load stock batches.')
    });
  }

  receiveStock(): void {
    if (!this.form.drugId || !this.form.batchNumber.trim() || !this.form.expiryDate) {
      return;
    }
    this.service.receiveStock({ ...this.form, drugId: this.form.drugId }).subscribe({
      next: () => {
        this.form = { drugId: null, batchNumber: '', expiryDate: '', quantityOnHand: 0, purchasePrice: 0, sellingPrice: 0 };
        this.refresh();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to receive stock.')
    });
  }
}
