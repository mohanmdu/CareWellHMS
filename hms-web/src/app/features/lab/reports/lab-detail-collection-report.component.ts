import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { LabCategory } from '../lab.model';
import { LabCategoryService } from '../lab-category.service';
import { LAB_PAYMENT_MODE_LABELS, LAB_PAYMENT_MODES, LabPaymentMode } from '../requisitions/lab-requisition.model';
import { LabCollectionReport, LabCollectionReportRow } from './lab-collection-report.model';
import { LabCollectionReportService } from './lab-collection-report.service';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const EMPTY_REPORT: LabCollectionReport = {
  rows: [],
  totals: { invoiceAmount: 0, doctorReferralAmount: 0, discountAmount: 0, receiptAmount: 0, refundAmount: 0, totalCollectionAmount: 0 }
};

/**
 * Lab Detail Collection Report: billed (APPROVED) LabRequisitions with
 * requisitionType "Labtest" only, filterable by Consultant, Lab Category
 * (matched against the item categoryName snapshot), and Payment Mode.
 */
@Component({
  selector: 'app-lab-detail-collection-report',
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
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './lab-detail-collection-report.component.html',
  styleUrl: './lab-detail-collection-report.component.scss'
})
export class LabDetailCollectionReportComponent {
  private readonly service = inject(LabCollectionReportService);
  private readonly consultantService = inject(ConsultantService);
  private readonly categoryService = inject(LabCategoryService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly paymentModes = LAB_PAYMENT_MODES;
  readonly paymentModeLabels = LAB_PAYMENT_MODE_LABELS;

  consultants = signal<Consultant[]>([]);
  categories = signal<LabCategory[]>([]);

  fromDate: Date | null = new Date();
  toDate: Date | null = new Date();
  consultantId: number | null = null;
  categoryId: number | null = null;
  paymentMode: LabPaymentMode | null = null;

  appliedFrom = signal<Date | null>(new Date());
  appliedTo = signal<Date | null>(new Date());
  appliedConsultantName = signal<string | null>(null);
  appliedCategoryName = signal<string | null>(null);
  appliedPaymentModeLabel = signal<string>('All');

  report = signal<LabCollectionReport>(EMPTY_REPORT);
  loading = signal(false);
  searched = signal(false);

  constructor() {
    this.consultantService.list().subscribe({
      next: (consultants) => this.consultants.set(consultants),
      error: () => this.notification.error('Failed to load consultants.')
    });
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.notification.error('Failed to load Lab categories.')
    });
    this.search();
  }

  paymentModeLabel(mode: string | null): string {
    return mode ? (this.paymentModeLabels as Record<string, string>)[mode] ?? mode : '—';
  }

  search(): void {
    this.appliedFrom.set(this.fromDate);
    this.appliedTo.set(this.toDate);
    this.appliedConsultantName.set(this.consultants().find((c) => c.id === this.consultantId)?.name ?? null);
    this.appliedCategoryName.set(this.categories().find((c) => c.id === this.categoryId)?.name ?? null);
    this.appliedPaymentModeLabel.set(this.paymentMode ? this.paymentModeLabels[this.paymentMode] : 'All');

    this.loading.set(true);
    this.service
      .getLabDetail({
        from: toIsoDate(this.fromDate),
        to: toIsoDate(this.toDate),
        consultantId: this.consultantId ?? undefined,
        categoryId: this.categoryId ?? undefined,
        paymentMode: this.paymentMode ?? undefined
      })
      .subscribe({
        next: (report) => {
          this.report.set(report);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the Lab detail collection report.');
        }
      });
  }

  viewInvoice(row: LabCollectionReportRow): void {
    this.router.navigate(['/lab/billing', row.requisitionId, 'receipt']);
  }
}
