import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification.service';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { Admission } from '../admissions/admission.model';
import { AdmissionService } from '../admissions/admission.service';
import { IpBillingLedger, IpBillingLineItem } from '../ip-billing/ip-billing.model';
import { IpBillingService } from '../ip-billing/ip-billing.service';
import { REPORT_PRINT_STYLES } from './report-print-styles';

const BILL_VIEWS = ['Provisional Detailed Bill', 'Provisional Summary Bill', 'Provisional Date Wise Bill'] as const;
type BillView = (typeof BILL_VIEWS)[number];

interface BillParticular {
  label: string;
  amount: number;
}

/** Provisional Customized Bill (PDF: "View Bill" drill-down from the Admission Report) - one BILLS dropdown, three client-side views of the same real ledger. */
@Component({
  selector: 'app-provisional-bill',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatFormFieldModule, MatProgressBarModule, MatSelectModule],
  templateUrl: './provisional-bill.component.html',
  styleUrl: './provisional-bill.component.scss'
})
export class ProvisionalBillComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admissionService = inject(AdmissionService);
  private readonly billingService = inject(IpBillingService);
  private readonly notification = inject(NotificationService);

  @ViewChild('billContent') billContent?: ElementRef<HTMLElement>;

  private readonly admissionId = Number(this.route.snapshot.paramMap.get('id'));
  readonly billViews = BILL_VIEWS;

  admission = signal<Admission | null>(null);
  ledger = signal<IpBillingLedger | null>(null);
  lineItems = signal<IpBillingLineItem[]>([]);
  loading = signal(true);
  billView = signal<BillView>('Provisional Detailed Bill');

  particulars = computed<BillParticular[]>(() => {
    const ledger = this.ledger();
    const admission = this.admission();
    if (!ledger || !admission) {
      return [];
    }
    switch (this.billView()) {
      case 'Provisional Summary Bill':
        return [{ label: 'Total Charges', amount: ledger.netTotal }];
      case 'Provisional Date Wise Bill':
        return this.dateWiseParticulars(admission);
      default:
        return ledger.rows.map((row) => ({ label: row.category.toUpperCase(), amount: row.net }));
    }
  });

  dueAmount = computed(() => {
    const ledger = this.ledger();
    const admission = this.admission();
    if (!ledger || !admission) {
      return 0;
    }
    return Math.max(ledger.netTotal - (admission.advanceAmount ?? 0), 0);
  });

  constructor() {
    forkJoin({
      admission: this.admissionService.get(this.admissionId),
      ledger: this.billingService.getLedger(this.admissionId),
      lineItems: this.billingService.listLineItems(this.admissionId)
    }).subscribe({
      next: ({ admission, ledger, lineItems }) => {
        this.admission.set(admission);
        this.ledger.set(ledger);
        this.lineItems.set(lineItems);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the bill.');
        this.router.navigate(['/ip/reports/admission']);
      }
    });
  }

  private dateWiseParticulars(admission: Admission): BillParticular[] {
    const byDate = new Map<string, number>();
    if (admission.admissionDate) {
      const wardBed = this.ledger()?.rows.find((r) => r.category === 'Ward/Bed Charges')?.net ?? 0;
      if (wardBed) {
        const admissionDay = admission.admissionDate.slice(0, 10);
        byDate.set(admissionDay, (byDate.get(admissionDay) ?? 0) + wardBed);
      }
    }
    for (const item of this.lineItems()) {
      if (!item.requestedOn) {
        continue;
      }
      const day = item.requestedOn.slice(0, 10);
      const net = item.lineTotal - item.discountAmount - item.refundAmount;
      byDate.set(day, (byDate.get(day) ?? 0) + net);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, amount]) => ({ label: this.formatDay(day), amount }));
  }

  private formatDay(isoDay: string): string {
    const [y, m, d] = isoDay.split('-');
    return `${d}/${m}/${y}`;
  }

  amountInWords(amount: number): string {
    return amount > 0 ? numberToWords(amount) : 'Zero';
  }

  print(): void {
    const content = this.billContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the bill.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Provisional Customized Bill</title>
          <style>${REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
