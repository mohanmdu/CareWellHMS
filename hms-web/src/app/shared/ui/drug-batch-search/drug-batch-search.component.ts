import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PharmacyStock } from '../../../features/pharmacy/pharmacy-billing/pharmacy-stock.model';
import { PharmacyStockService } from '../../../features/pharmacy/pharmacy-billing/pharmacy-stock.service';

/**
 * Rich multi-column drug/batch autocomplete - each suggestion shows Drug
 * Name/Batch/Qty/MRP/Exp.Date as a genuine multi-column row, not the single
 * concatenated text line every other autocomplete in this app uses (see
 * pharmacy-bill-entry.component.ts). Shared by Stock Adjustment,
 * Batch-wise Stock Modifier, and Purchase Return's drug lookup.
 */
@Component({
  selector: 'app-drug-batch-search',
  standalone: true,
  imports: [FormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  templateUrl: './drug-batch-search.component.html',
  styleUrl: './drug-batch-search.component.scss'
})
export class DrugBatchSearchComponent {
  private readonly stockService = inject(PharmacyStockService);

  readonly batchSelected = output<PharmacyStock>();

  searchTerm = '';
  results = signal<PharmacyStock[]>([]);

  onSearchChange(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.results.set([]);
      return;
    }
    this.stockService.search(term).subscribe({
      next: (stock) => this.results.set(stock),
      error: () => this.results.set([])
    });
  }

  select(stock: PharmacyStock): void {
    this.searchTerm = stock.productName;
    this.results.set([]);
    this.batchSelected.emit(stock);
  }

  reset(): void {
    this.searchTerm = '';
    this.results.set([]);
  }
}
