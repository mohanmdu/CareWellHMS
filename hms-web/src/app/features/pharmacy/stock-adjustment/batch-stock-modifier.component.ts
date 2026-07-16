import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyStock } from '../pharmacy-billing/pharmacy-stock.model';
import { PharmacyStockService } from '../pharmacy-billing/pharmacy-stock.service';

type ModificationType = 'PACKING_QTY' | 'MRP';

/**
 * Batch-wise Stock Modifier tab content - search by Batch No or Drug Name,
 * then edit either Qty/Qty-per-Pack or MRP directly on the matching
 * PharmacyStock row(s), depending on the selected Modification Type. Each
 * row's Update saves immediately (PATCH /pharmacy/stock/{id}/packing or
 * /mrp) - no batch confirm step, matching the legacy per-row "Update"
 * button. Embedded as a tab inside stock-adjustment.component.ts (no
 * page-header of its own).
 */
@Component({
  selector: 'app-batch-stock-modifier',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './batch-stock-modifier.component.html',
  styleUrl: './batch-stock-modifier.component.scss'
})
export class BatchStockModifierComponent {
  private readonly stockService = inject(PharmacyStockService);
  private readonly notification = inject(NotificationService);

  readonly modificationTypeLabels: Record<ModificationType, string> = {
    PACKING_QTY: 'Change Packing & Qty',
    MRP: 'Change MRP'
  };

  batchNo = '';
  drugName = '';
  modificationType: ModificationType = 'PACKING_QTY';
  loading = signal(false);
  searched = signal(false);
  results = signal<PharmacyStock[]>([]);

  editValues: Record<number, { quantityOnHand: number; packing: number; mrp: number }> = {};

  get displayedColumns(): string[] {
    return ['productName', 'productTypeName', 'batch', this.modificationType === 'PACKING_QTY' ? 'packingQty' : 'mrp', 'update'];
  }

  getStock(): void {
    const term = this.batchNo.trim() || this.drugName.trim();
    if (!term) {
      return;
    }
    this.loading.set(true);
    this.stockService.search(term).subscribe({
      next: (stock) => {
        this.loading.set(false);
        this.searched.set(true);
        this.results.set(stock);
        this.editValues = Object.fromEntries(
          stock.map((s) => [s.id, { quantityOnHand: s.quantityOnHand, packing: s.packing ?? 1, mrp: s.mrp ?? 0 }])
        );
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to fetch stock.');
      }
    });
  }

  update(stock: PharmacyStock): void {
    const edit = this.editValues[stock.id];
    if (!edit) {
      return;
    }
    const request$ =
      this.modificationType === 'PACKING_QTY'
        ? this.stockService.updatePacking(stock.id, edit.quantityOnHand, edit.packing)
        : this.stockService.updateMrp(stock.id, edit.mrp);

    request$.subscribe({
      next: (updated) => {
        this.results.set(this.results().map((s) => (s.id === updated.id ? updated : s)));
        this.notification.success('Batch updated.');
      },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to update batch.')
    });
  }
}
