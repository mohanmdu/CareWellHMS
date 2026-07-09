import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PharmacySale } from './pharmacy-sale.model';
import { PharmacySaleService } from './pharmacy-sale.service';

/**
 * Same expandable-row table recipe as Billing > Invoices (§5.5): one row per
 * sale, expand in place for the dispensed line items instead of navigating
 * to a separate detail page.
 */
@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [DecimalPipe, MatTableModule, MatButtonModule, MatProgressBarModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './sale-list.component.html',
  styleUrl: './sale-list.component.scss'
})
export class SaleListComponent {
  private readonly service = inject(PharmacySaleService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['saleNumber', 'patient', 'total', 'actions'];

  sales = signal<PharmacySale[]>([]);
  loading = signal(false);
  expandedSaleId = signal<number | null>(null);

  constructor() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load sales.');
      }
    });
  }

  toggle(sale: PharmacySale): void {
    this.expandedSaleId.set(this.expandedSaleId() === sale.id ? null : sale.id);
  }
}
