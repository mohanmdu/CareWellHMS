import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ProductMovementEntry } from './pharmacy-statement-report.model';
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

/** Fast/Slow/Non-Moving are 3 sorts/filters over one shared per-product movement dataset, fetched once. */
@Component({
  selector: 'app-pharmacy-mis',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTabsModule,
    EmptyStateComponent
  ],
  templateUrl: './pharmacy-mis.component.html',
  styleUrl: './pharmacy-mis.component.scss'
})
export class PharmacyMisComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly notification = inject(NotificationService);

  @ViewChild('fastContent') fastContent?: ElementRef<HTMLElement>;
  @ViewChild('slowContent') slowContent?: ElementRef<HTMLElement>;
  @ViewChild('nonMovingContent') nonMovingContent?: ElementRef<HTMLElement>;

  entries = signal<ProductMovementEntry[]>([]);
  loading = signal(false);
  readonly today = new Date();

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  readonly fastMoving = computed(() => [...this.entries()].sort((a, b) => b.netQty - a.netQty));
  readonly slowMoving = computed(() =>
    this.entries()
      .filter((e) => e.netQty > 0)
      .sort((a, b) => a.netQty - b.netQty)
  );
  readonly nonMoving = computed(() => this.entries().filter((e) => e.purchaseQty > 0 && e.salesQty === 0));

  constructor() {
    this.submit();
  }

  submit(): void {
    this.loading.set(true);
    this.service.productMovement(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Pharmacy MIS report.');
      }
    });
  }

  print(content: ElementRef<HTMLElement> | undefined, title: string): void {
    const html = content?.nativeElement.innerHTML;
    if (!html) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>${SALES_GST_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  printFast(): void {
    this.print(this.fastContent, 'Pharmacy Fast Moving Report');
  }

  printSlow(): void {
    this.print(this.slowContent, 'Slow Moving Report');
  }

  printNonMoving(): void {
    this.print(this.nonMovingContent, 'Non Moving Report');
  }
}
