import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaySupplierDialogComponent } from './pay-supplier-dialog.component';
import { InvoiceOutstanding, SupplierPaymentHistory, VendorOutstanding } from './supplier-payment.model';
import { SupplierPaymentService } from './supplier-payment.service';

/**
 * 4-level nested view - Vendor grid -> per-vendor Invoice grid (expand/hide)
 * -> per-invoice Payment History (expand) -> Make Pay. The legacy spec shows
 * Make Pay as an inline-expanding row panel; implemented here as the same
 * shared dialog used for Pay All/Pay Selected instead, for consistency with
 * every other data-entry action in this app (which uses dialogs, not
 * inline row-editors) - a deliberate, documented simplification.
 */
@Component({
  selector: 'app-supplier-outstanding-payments',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatCheckboxModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './supplier-outstanding-payments.component.html',
  styleUrl: './supplier-outstanding-payments.component.scss'
})
export class SupplierOutstandingPaymentsComponent {
  private readonly service = inject(SupplierPaymentService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  vendors = signal<VendorOutstanding[]>([]);
  loading = signal(false);

  expandedSuppliers = signal<Set<number>>(new Set());
  invoicesBySupplier = signal<Map<number, InvoiceOutstanding[]>>(new Map());
  expandedInvoices = signal<Set<number>>(new Set());
  historyByInvoice = signal<Map<number, SupplierPaymentHistory[]>>(new Map());
  selectedInvoiceIds = signal<Set<number>>(new Set());

  constructor() {
    this.refresh();
  }

  get totalBalance(): number {
    return this.vendors().reduce((sum, v) => sum + v.balanceAmount, 0);
  }

  refresh(): void {
    this.loading.set(true);
    this.service.vendorOutstanding().subscribe({
      next: (vendors) => {
        this.vendors.set(vendors);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load supplier outstanding payments.');
      }
    });
  }

  isVendorExpanded(vendor: VendorOutstanding): boolean {
    return this.expandedSuppliers().has(vendor.supplierId);
  }

  toggleVendor(vendor: VendorOutstanding): void {
    const expanded = new Set(this.expandedSuppliers());
    if (expanded.has(vendor.supplierId)) {
      expanded.delete(vendor.supplierId);
      this.expandedSuppliers.set(expanded);
      return;
    }
    expanded.add(vendor.supplierId);
    this.expandedSuppliers.set(expanded);
    this.loadInvoices(vendor.supplierId);
  }

  private loadInvoices(supplierId: number): void {
    this.service.invoicesForVendor(supplierId).subscribe({
      next: (invoices) => {
        const map = new Map(this.invoicesBySupplier());
        map.set(supplierId, invoices);
        this.invoicesBySupplier.set(map);
      },
      error: () => this.notification.error('Failed to load invoices for this vendor.')
    });
  }

  invoicesFor(vendor: VendorOutstanding): InvoiceOutstanding[] {
    return this.invoicesBySupplier().get(vendor.supplierId) ?? [];
  }

  isInvoiceExpanded(invoice: InvoiceOutstanding): boolean {
    return this.expandedInvoices().has(invoice.grnId);
  }

  toggleHistory(invoice: InvoiceOutstanding): void {
    const expanded = new Set(this.expandedInvoices());
    if (expanded.has(invoice.grnId)) {
      expanded.delete(invoice.grnId);
      this.expandedInvoices.set(expanded);
      return;
    }
    expanded.add(invoice.grnId);
    this.expandedInvoices.set(expanded);
    this.service.paymentHistory(invoice.grnId).subscribe({
      next: (history) => {
        const map = new Map(this.historyByInvoice());
        map.set(invoice.grnId, history);
        this.historyByInvoice.set(map);
      },
      error: () => this.notification.error('Failed to load payment history.')
    });
  }

  historyFor(invoice: InvoiceOutstanding): SupplierPaymentHistory[] {
    return this.historyByInvoice().get(invoice.grnId) ?? [];
  }

  isSelected(invoice: InvoiceOutstanding): boolean {
    return this.selectedInvoiceIds().has(invoice.grnId);
  }

  toggleSelect(invoice: InvoiceOutstanding): void {
    const selected = new Set(this.selectedInvoiceIds());
    if (selected.has(invoice.grnId)) {
      selected.delete(invoice.grnId);
    } else {
      selected.add(invoice.grnId);
    }
    this.selectedInvoiceIds.set(selected);
  }

  payAll(vendor: VendorOutstanding): void {
    this.dialog
      .open(PaySupplierDialogComponent, {
        width: '420px',
        data: { title: `Payment Details(${vendor.supplierName})`, defaultAmount: vendor.balanceAmount, maxAmount: vendor.balanceAmount }
      })
      .afterClosed()
      .subscribe((request) => {
        if (!request) {
          return;
        }
        this.service.payAll(vendor.supplierId, request).subscribe({
          next: () => {
            this.notification.success('Payment recorded.');
            this.refreshAfterPayment(vendor.supplierId);
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to record payment.')
        });
      });
  }

  paySelected(vendor: VendorOutstanding): void {
    const invoices = this.invoicesFor(vendor).filter((i) => this.isSelected(i));
    if (invoices.length === 0) {
      this.notification.error('Select at least one invoice first.');
      return;
    }
    const total = invoices.reduce((sum, i) => sum + i.amountToPay, 0);
    this.dialog
      .open(PaySupplierDialogComponent, {
        width: '420px',
        data: { title: `Selected Payment Details(${vendor.supplierName})`, defaultAmount: total, maxAmount: total }
      })
      .afterClosed()
      .subscribe((request) => {
        if (!request) {
          return;
        }
        this.service.paySelected(invoices.map((i) => i.grnId), request).subscribe({
          next: () => {
            this.notification.success('Payment recorded.');
            this.refreshAfterPayment(vendor.supplierId);
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to record payment.')
        });
      });
  }

  makePay(vendor: VendorOutstanding, invoice: InvoiceOutstanding): void {
    this.dialog
      .open(PaySupplierDialogComponent, {
        width: '420px',
        data: { title: `Make Payment (Invoice ${invoice.invoiceNo})`, defaultAmount: invoice.amountToPay, maxAmount: invoice.amountToPay }
      })
      .afterClosed()
      .subscribe((request) => {
        if (!request) {
          return;
        }
        this.service.payInvoice(invoice.grnId, request).subscribe({
          next: () => {
            this.notification.success('Payment recorded.');
            this.refreshAfterPayment(vendor.supplierId);
            if (this.isInvoiceExpanded(invoice)) {
              this.service.paymentHistory(invoice.grnId).subscribe((history) => {
                const map = new Map(this.historyByInvoice());
                map.set(invoice.grnId, history);
                this.historyByInvoice.set(map);
              });
            }
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to record payment.')
        });
      });
  }

  private refreshAfterPayment(supplierId: number): void {
    this.refresh();
    if (this.expandedSuppliers().has(supplierId)) {
      this.loadInvoices(supplierId);
    }
    const selected = new Set(this.selectedInvoiceIds());
    for (const invoice of this.invoicesBySupplier().get(supplierId) ?? []) {
      selected.delete(invoice.grnId);
    }
    this.selectedInvoiceIds.set(selected);
  }
}
