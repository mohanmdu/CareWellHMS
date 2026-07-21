import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LabRefundReceiptEntry } from './lab-refund.model';
import { LabRefundService } from './lab-refund.service';

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
 * Refund Report: every LabRefund in a date range. "Type" shows the
 * requisition's patientType (OP/IP) and "Billing Type" shows its
 * requisitionType (Labtest/Billing) - the closest real fields this schema
 * has to the reference's "Type"/"Billing Type" columns.
 */
@Component({
  selector: 'app-lab-refund-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    EmptyStateComponent
  ],
  templateUrl: './lab-refund-report.component.html',
  styleUrl: './lab-refund-report.component.scss'
})
export class LabRefundReportComponent {
  private readonly service = inject(LabRefundService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  fromDate: Date | null = new Date();
  toDate: Date | null = new Date();

  entries = signal<LabRefundReceiptEntry[]>([]);
  loading = signal(false);
  searched = signal(false);

  totalRefundAmount = computed(() => this.entries().reduce((sum, e) => sum + e.refundAmount, 0));

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.service.getReport(toIsoDate(this.fromDate), toIsoDate(this.toDate)).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the refund report.');
      }
    });
  }

  viewReceipt(entry: LabRefundReceiptEntry): void {
    this.router.navigate(['/lab/refunds', entry.id, 'receipt']);
  }
}
