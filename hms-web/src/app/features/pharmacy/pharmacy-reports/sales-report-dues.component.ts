import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyBillPrintDialogComponent } from '../pharmacy-billing/pharmacy-bill-print-dialog.component';
import { PharmacySaleListEntry, PharmacySaleSource } from '../pharmacy-billing/pharmacy-sale.model';
import { PharmacySaleService } from '../pharmacy-billing/pharmacy-sale.service';

/**
 * Current Dues / OP Dues / IP Dues / Others Dues / Insurance Patient Dues -
 * all backed by PharmacySale.balanceAmount > 0 (see PharmacySaleRepository.findDue),
 * filtered by source. "Insurance Patient Dues" is always empty for now -
 * PharmacySale has no insurance linkage yet (a genuinely separate,
 * not-yet-built integration, same posture as the OP/IP pending-request
 * queue elsewhere in this module).
 */
@Component({
  selector: 'app-sales-report-dues',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet, MatProgressBarModule, MatTableModule, MatTabsModule, EmptyStateComponent],
  templateUrl: './sales-report-dues.component.html',
  styleUrl: './sales-report-dues.component.scss'
})
export class SalesReportDuesComponent {
  private readonly service = inject(PharmacySaleService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['billNumber', 'patientName', 'totalAmount', 'discountAmount', 'amountPaid', 'balanceAmount'];

  currentDues = signal<PharmacySaleListEntry[]>([]);
  opDues = signal<PharmacySaleListEntry[]>([]);
  ipDues = signal<PharmacySaleListEntry[]>([]);
  othersDues = signal<PharmacySaleListEntry[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.due().subscribe({
      next: (entries) => {
        this.currentDues.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load current dues.');
      }
    });
  }

  onTabChange(index: number): void {
    const bySource: Record<number, PharmacySaleSource> = { 1: 'OP', 2: 'IP', 3: 'OTHERS' };
    const source = bySource[index];
    if (!source) {
      return;
    }
    this.service.due(source).subscribe({
      next: (entries) => {
        if (source === 'OP') this.opDues.set(entries);
        else if (source === 'IP') this.ipDues.set(entries);
        else this.othersDues.set(entries);
      },
      error: () => this.notification.error('Failed to load dues.')
    });
  }

  viewBill(entry: PharmacySaleListEntry): void {
    this.service.get(entry.id).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '640px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load bill.')
    });
  }
}
