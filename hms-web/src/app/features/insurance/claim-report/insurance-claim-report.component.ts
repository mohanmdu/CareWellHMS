import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
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
 * Insurance Claim Report: every APPROVED pre-authorization request (a
 * "claim" only exists once approved - see PreAuthorizationRequestService),
 * optionally filtered by decided-date range / insurer / patient UHID. Edit
 * opens "Change the Amount" to correct the estimated/claimed amount, card
 * no, and claim no after the fact - it doesn't touch the decision itself.
 * Type always reads "Pre-Authorization" (this system has no separate
 * Enhancement claim type).
 */
@Component({
  selector: 'app-insurance-claim-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './insurance-claim-report.component.html',
  styleUrl: './insurance-claim-report.component.scss'
})
export class InsuranceClaimReportComponent {
  private readonly requestService = inject(PreAuthorizationRequestService);
  private readonly notification = inject(NotificationService);
  private readonly promptDialog = inject(PromptDialogService);

  readonly insuranceCompanyOptions = INSURANCE_COMPANY_OPTIONS;

  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedCompany = '';
  patientUhid = '';

  loading = signal(false);
  searched = signal(false);
  requests = signal<PreAuthorizationRequest[]>([]);

  billCount = computed(() => this.requests().length);
  totalEstimation = computed(() => this.requests().reduce((sum, r) => sum + r.requestedAmount, 0));
  totalClaimsApproved = computed(() => this.requests().reduce((sum, r) => sum + (r.approvedAmount ?? 0), 0));

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.requestService
      .getApprovedReport({
        from: toIsoDate(this.fromDate),
        to: toIsoDate(this.toDate),
        insurerName: this.selectedCompany || undefined,
        patientUhid: this.patientUhid.trim() || undefined
      })
      .subscribe({
        next: (requests) => {
          this.requests.set(requests);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the insurance claim report.');
        }
      });
  }

  editAmount(request: PreAuthorizationRequest): void {
    if (request.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: 'Change the Amount',
        fields: [
          {
            key: 'requestedAmount',
            label: 'Please enter the New Estimated Amount',
            type: 'number',
            initialValue: request.requestedAmount,
            required: true,
            min: 0
          },
          {
            key: 'approvedAmount',
            label: 'Please enter the New Claimed Amount',
            type: 'number',
            initialValue: request.approvedAmount ?? 0,
            required: true,
            min: 0
          },
          {
            key: 'cardNumber',
            label: 'Please enter the Card No',
            type: 'text',
            initialValue: request.cardNumber ?? ''
          },
          {
            key: 'claimNumber',
            label: 'Please enter the Claim No',
            type: 'text',
            initialValue: request.claimNumber ?? ''
          }
        ],
        confirmLabel: 'Update'
      })
      .subscribe((values) => {
        if (!values || request.id === null) {
          return;
        }
        this.requestService
          .amend(request.id, {
            requestedAmount: Number(values['requestedAmount']),
            approvedAmount: Number(values['approvedAmount']),
            cardNumber: String(values['cardNumber'] ?? '').trim() || null,
            claimNumber: String(values['claimNumber'] ?? '').trim() || null
          })
          .subscribe({
            next: (updated) => {
              this.requests.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
              this.notification.success('Amount updated.');
            },
            error: (err) => this.notification.error(err.error?.message ?? 'Failed to update the amount.')
          });
      });
  }
}
