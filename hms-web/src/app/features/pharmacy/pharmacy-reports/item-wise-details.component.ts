import { DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { Manufacturer } from '../inventory-master/manufacturers/manufacturer.model';
import { ManufacturerService } from '../inventory-master/manufacturers/manufacturer.service';
import { Supplier } from '../inventory-master/suppliers/supplier.model';
import { SupplierService } from '../inventory-master/suppliers/supplier.service';
import { GrnViewDialogComponent } from '../purchase-management/grn/grn-view-dialog.component';
import { ItemWiseDetailEntry, ItemWiseReportType } from './pharmacy-statement-report.model';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';
import { SALES_GST_REPORT_PRINT_STYLES } from './sales-gst-report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * "Report Type" (Supplier/Company/Product Wise) is a frontend-only toggle of
 * which filter is primary - the backend takes all three filters together
 * and ANDs whichever are set. "Company Name" is Manufacturer (Product has
 * no separate Company concept - see plan doc).
 */
@Component({
  selector: 'app-item-wise-details',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './item-wise-details.component.html',
  styleUrl: './item-wise-details.component.scss'
})
export class ItemWiseDetailsComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly supplierService = inject(SupplierService);
  private readonly manufacturerService = inject(ManufacturerService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  suppliers = signal<Supplier[]>([]);
  manufacturers = signal<Manufacturer[]>([]);
  entries = signal<ItemWiseDetailEntry[]>([]);
  loading = signal(false);
  loaded = signal(false);

  reportType: ItemWiseReportType = 'SUPPLIER';
  supplierId: number | null = null;
  manufacturerId: number | null = null;
  drugName = '';
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  readonly totalQty = computed(() => this.entries().reduce((sum, e) => sum + e.qty, 0));
  readonly totalNetAmount = computed(() => this.entries().reduce((sum, e) => sum + e.netAmountInclGst, 0));

  constructor() {
    this.supplierService.list().subscribe({ next: (suppliers) => this.suppliers.set(suppliers), error: () => {} });
    this.manufacturerService.list().subscribe({ next: (manufacturers) => this.manufacturers.set(manufacturers), error: () => {} });
  }

  getStock(): void {
    this.loading.set(true);
    this.service
      .itemWiseDetails(
        toIsoDate(this.fromDate()),
        toIsoDate(this.toDate()),
        this.reportType === 'SUPPLIER' ? (this.supplierId ?? undefined) : undefined,
        this.reportType === 'COMPANY' ? (this.manufacturerId ?? undefined) : undefined,
        this.reportType === 'PRODUCT' ? this.drugName.trim() || undefined : undefined
      )
      .subscribe({
        next: (entries) => {
          this.entries.set(entries);
          this.loading.set(false);
          this.loaded.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load Item Wise Details.');
        }
      });
  }

  viewGrn(entry: ItemWiseDetailEntry): void {
    this.dialog.open(GrnViewDialogComponent, { width: '960px', maxWidth: '95vw', data: { grnId: entry.grnId } });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Item Wise Details</title>
          <style>${SALES_GST_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
