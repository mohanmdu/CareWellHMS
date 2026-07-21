import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { Patient } from '../../registration/patients/patient.model';
import { PreAuthorizationRequest } from './pre-authorization-request.model';
import { PreAuthorizationRequestService } from './pre-authorization-request.service';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  YET_TO_BE_RAISED: 'neutral',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral'
};

const STATUS_LABELS: Record<string, string> = {
  YET_TO_BE_RAISED: 'Yet to be Raised',
  PENDING: 'Pre-Authorization Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  INSURANCE: 'Insurance',
  CORPORATE: 'Corporate'
};

/**
 * Insurance Pre Authorisation Requests. A row arrives two ways - auto-seeded
 * from an Admission (status YET_TO_BE_RAISED, Inpatient ID/DOA/Payment
 * Type/Location all populated from that admission) or raised directly here
 * via the form below (status PENDING immediately, no admission details).
 * "Raise Pre-Authorization" expands an inline panel in that row's action
 * cell (not a modal) for Estimated Amount/Policy No/Card No, confirmed via
 * ConfirmDialogService, landing on "Waiting for Approval from Insurance
 * Company" - Approve/Reject aren't actioned from this screen (they'd belong
 * to a separate Insurance Approval Queue, not built yet), so only Cancel
 * remains available pre-decision.
 */
@Component({
  selector: 'app-pre-authorization-worklist',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PatientSearchComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './pre-authorization-worklist.component.html',
  styleUrl: './pre-authorization-worklist.component.scss'
})
export class PreAuthorizationWorklistComponent {
  private readonly requestService = inject(PreAuthorizationRequestService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly statusTone = STATUS_TONE;
  readonly statusLabels = STATUS_LABELS;
  readonly paymentTypeLabels = PAYMENT_TYPE_LABELS;

  loading = signal(false);
  requests = signal<PreAuthorizationRequest[]>([]);
  selectedPatient = signal<Patient | null>(null);
  submitting = signal(false);

  raisingId = signal<number | null>(null);
  raising = signal(false);
  raiseForm: { estimatedAmount: number | null; policyNo: string; cardNo: string } = {
    estimatedAmount: null,
    policyNo: '',
    cardNo: ''
  };

  form = {
    policyNumber: '',
    cardNumber: '',
    insurerName: '',
    tpaName: '',
    corporateName: '',
    requestedAmount: 0
  };

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.requestService.list().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load pre authorization requests.');
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  changePatient(): void {
    this.selectedPatient.set(null);
  }

  submit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || !this.form.policyNumber.trim() || !this.form.insurerName.trim()) {
      return;
    }
    this.submitting.set(true);
    this.requestService
      .create({
        patientId: patient.id,
        policyNumber: this.form.policyNumber,
        cardNumber: this.form.cardNumber || null,
        insurerName: this.form.insurerName,
        tpaName: this.form.tpaName || null,
        corporateName: this.form.corporateName || null,
        requestedAmount: this.form.requestedAmount
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.selectedPatient.set(null);
          this.form = { policyNumber: '', cardNumber: '', insurerName: '', tpaName: '', corporateName: '', requestedAmount: 0 };
          this.notification.success('Pre authorization request raised.');
          this.refresh();
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to raise the request.');
        }
      });
  }

  startRaise(request: PreAuthorizationRequest): void {
    this.raisingId.set(request.id);
    this.raiseForm = { estimatedAmount: null, policyNo: '', cardNo: '' };
  }

  cancelRaiseForm(): void {
    this.raisingId.set(null);
  }

  get canConfirmRaise(): boolean {
    return this.raiseForm.policyNo.trim().length > 0 && this.raiseForm.estimatedAmount !== null && this.raiseForm.estimatedAmount >= 0;
  }

  confirmRaise(request: PreAuthorizationRequest): void {
    if (request.id === null || !this.canConfirmRaise) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: 'Raise Pre-Authorization',
        message: 'Are you sure you want to Raise Pre-Authorization?',
        confirmLabel: 'OK'
      })
      .subscribe((confirmed) => {
        if (!confirmed || request.id === null) {
          return;
        }
        this.raising.set(true);
        this.requestService
          .raise(request.id, {
            policyNumber: this.raiseForm.policyNo,
            cardNumber: this.raiseForm.cardNo || null,
            requestedAmount: this.raiseForm.estimatedAmount ?? 0
          })
          .subscribe({
            next: () => {
              this.raising.set(false);
              this.raisingId.set(null);
              this.notification.success('Pre-Authorization raised.');
              this.refresh();
            },
            error: (err) => {
              this.raising.set(false);
              this.notification.error(err.error?.message ?? 'Failed to raise the request.');
            }
          });
      });
  }

  cancelRequest(request: PreAuthorizationRequest): void {
    if (request.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Cancel request ${request.requestNumber}`,
        message: 'This pre authorization request will be cancelled.',
        confirmLabel: 'Cancel Request',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || request.id === null) {
          return;
        }
        this.requestService.cancel(request.id, 'Cancelled by staff').subscribe({
          next: () => {
            this.notification.success('Request cancelled.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to cancel the request.')
        });
      });
  }
}
