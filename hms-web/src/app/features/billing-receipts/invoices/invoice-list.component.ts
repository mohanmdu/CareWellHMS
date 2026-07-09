import { Component, inject, signal } from '@angular/core';
import { Invoice } from './invoice.model';
import { InvoiceService } from './invoice.service';

/**
 * Replaces the legacy Receipts/CashierOPBillingInvoicePrint.jsp and the
 * per-department duplicate print JSPs (migration doc §4.1) - a PAID invoice
 * IS the receipt here, viewed inline rather than a separate print-only page.
 */
@Component({
  selector: 'app-invoice-list',
  standalone: true,
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent {
  private readonly service = inject(InvoiceService);

  invoices = signal<Invoice[]>([]);
  errorMessage = signal<string | null>(null);
  expandedId = signal<number | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (invoices) => this.invoices.set(invoices),
      error: () => this.errorMessage.set('Failed to load invoices.')
    });
  }

  toggle(invoice: Invoice): void {
    this.expandedId.set(this.expandedId() === invoice.id ? null : invoice.id);
  }

  pay(invoice: Invoice): void {
    if (invoice.id === null) return;
    this.service.pay(invoice.id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to mark invoice paid.')
    });
  }

  cancel(invoice: Invoice): void {
    if (invoice.id === null) return;
    const reason = prompt('Cancellation/refund reason?') ?? '';
    this.service.cancel(invoice.id, reason).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to cancel invoice.')
    });
  }
}
