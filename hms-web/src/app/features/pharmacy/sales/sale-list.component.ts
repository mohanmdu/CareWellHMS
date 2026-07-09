import { Component, inject, signal } from '@angular/core';
import { PharmacySale } from './pharmacy-sale.model';
import { PharmacySaleService } from './pharmacy-sale.service';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  templateUrl: './sale-list.component.html'
})
export class SaleListComponent {
  private readonly service = inject(PharmacySaleService);

  sales = signal<PharmacySale[]>([]);
  errorMessage = signal<string | null>(null);
  expandedId = signal<number | null>(null);

  constructor() {
    this.service.list().subscribe({
      next: (sales) => this.sales.set(sales),
      error: () => this.errorMessage.set('Failed to load sales.')
    });
  }

  toggle(sale: PharmacySale): void {
    this.expandedId.set(this.expandedId() === sale.id ? null : sale.id);
  }
}
