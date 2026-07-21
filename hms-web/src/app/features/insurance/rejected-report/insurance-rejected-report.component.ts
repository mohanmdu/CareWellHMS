import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PreAuthorizationRequest } from '../pre-authorization/pre-authorization-request.model';
import { PreAuthorizationRequestService } from '../pre-authorization/pre-authorization-request.service';

// Same fixed insurer list used on the IP Admission form's Insurance Company field.
const INSURANCE_COMPANY_OPTIONS = [
  'VIPUL MEDCORP TPA PVT LTD.',
  'ERICTION INSURANCE TPA PVT LTD.',
  'STAR HEALTH AND ALLIED INSURANCE CO.LTD.',
  'TAMILNADU GOVERNMENT EMPLOYEES SCHEME'
];

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
 * Insurance Rejected Report: every REJECTED pre-authorization request,
 * optionally filtered by decided-date range / insurer. Read-only - a
 * rejected request has no claim amount to correct, so (unlike the Claim
 * Report) there's no Edit action here. "Total Rejected Amount" sums the
 * requested/estimated amount (ESTIMATION column), since a rejection never
 * carries an approved amount. Type always reads "Pre-Authorization" (this
 * system has no separate Enhancement claim type).
 */
@Component({
  selector: 'app-insurance-rejected-report',
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
  templateUrl: './insurance-rejected-report.component.html',
  styleUrl: './insurance-rejected-report.component.scss'
})
export class InsuranceRejectedReportComponent {
  private readonly requestService = inject(PreAuthorizationRequestService);
  private readonly notification = inject(NotificationService);

  readonly insuranceCompanyOptions = INSURANCE_COMPANY_OPTIONS;

  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedCompany = '';

  loading = signal(false);
  searched = signal(false);
  requests = signal<PreAuthorizationRequest[]>([]);

  billCount = computed(() => this.requests().length);
  totalRejectedAmount = computed(() => this.requests().reduce((sum, r) => sum + r.requestedAmount, 0));

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.requestService
      .getRejectedReport({
        from: toIsoDate(this.fromDate),
        to: toIsoDate(this.toDate),
        insurerName: this.selectedCompany || undefined
      })
      .subscribe({
        next: (requests) => {
          this.requests.set(requests);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the insurance rejected report.');
        }
      });
  }
}
