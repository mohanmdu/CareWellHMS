import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyBillPrintDialogComponent } from '../pharmacy-billing/pharmacy-bill-print-dialog.component';
import { PharmacyLocation } from '../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../pharmacy-billing/pharmacy-location.service';
import { PharmacySaleListEntry, PharmacySaleSource } from '../pharmacy-billing/pharmacy-sale.model';
import { PharmacySaleService } from '../pharmacy-billing/pharmacy-sale.service';
import { PayNowDialogComponent } from './pay-now-dialog.component';

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
  imports: [
    DecimalPipe,
    NgTemplateOutlet,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    EmptyStateComponent
  ],
  templateUrl: './sales-report-dues.component.html',
  styleUrl: './sales-report-dues.component.scss'
})
export class SalesReportDuesComponent {
  private readonly service = inject(PharmacySaleService);
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'billNumber',
    'registrationNumber',
    'patientName',
    'totalAmount',
    'discountAmount',
    'amountPaid',
    'balanceAmount',
    'payNow'
  ];

  locations = signal<PharmacyLocation[]>([]);
  currentDues = signal<PharmacySaleListEntry[]>([]);
  opDues = signal<PharmacySaleListEntry[]>([]);
  ipDues = signal<PharmacySaleListEntry[]>([]);
  othersDues = signal<PharmacySaleListEntry[]>([]);
  loading = signal(false);
  activeTabIndex = signal(0);

  nameOrMobile = '';
  pid = '';
  locationId: number | null = null;

  readonly totalDue = computed(() => {
    const entriesByTab: Record<number, PharmacySaleListEntry[]> = {
      0: this.currentDues(),
      1: this.opDues(),
      2: this.ipDues(),
      3: this.othersDues()
    };
    const entries = entriesByTab[this.activeTabIndex()] ?? [];
    return entries.reduce((sum, entry) => sum + entry.balanceAmount, 0);
  });

  constructor() {
    this.locationService.list().subscribe({ next: (locations) => this.locations.set(locations), error: () => {} });
    this.refresh();
  }

  search(): void {
    this.refresh();
    this.loadForSource(this.sourceForTab(this.activeTabIndex()));
  }

  refresh(): void {
    this.loading.set(true);
    this.service.due(this.filterFor(undefined)).subscribe({
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
    this.activeTabIndex.set(index);
    this.loadForSource(this.sourceForTab(index));
  }

  private sourceForTab(index: number): PharmacySaleSource | undefined {
    const bySource: Record<number, PharmacySaleSource> = { 1: 'OP', 2: 'IP', 3: 'OTHERS' };
    return bySource[index];
  }

  private loadForSource(source: PharmacySaleSource | undefined): void {
    if (!source) {
      return;
    }
    this.service.due(this.filterFor(source)).subscribe({
      next: (entries) => {
        if (source === 'OP') this.opDues.set(entries);
        else if (source === 'IP') this.ipDues.set(entries);
        else this.othersDues.set(entries);
      },
      error: () => this.notification.error('Failed to load dues.')
    });
  }

  private filterFor(source: PharmacySaleSource | undefined) {
    return {
      source,
      locationId: this.locationId ?? undefined,
      pid: this.pid.trim() || undefined,
      nameOrMobile: this.nameOrMobile.trim() || undefined
    };
  }

  viewBill(entry: PharmacySaleListEntry): void {
    this.service.get(entry.id).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '900px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load bill.')
    });
  }

  payNow(entry: PharmacySaleListEntry): void {
    this.dialog
      .open(PayNowDialogComponent, { width: '420px', maxWidth: '95vw', data: { entry } })
      .afterClosed()
      .subscribe((request) => {
        if (!request) {
          return;
        }
        this.service.pay(entry.id, request).subscribe({
          next: () => {
            this.notification.success('Payment recorded.');
            this.search();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to record payment.')
        });
      });
  }
}
