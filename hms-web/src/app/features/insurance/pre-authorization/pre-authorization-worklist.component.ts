import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
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
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

/**
 * Insurance Module: Pre Authorization Request worklist. Rows arrive two
 * ways - auto-seeded from an Admission whose insuranceType != "None" (status
 * YET_TO_BE_RAISED, no policy number yet - see "Raise" action), or raised
 * directly here via the form below (status PENDING immediately). Replaces
 * the earlier generic Insurance Claims module (which also modeled
 * Enhancement claims, dropped here as out of scope).
 */
@Component({
  selector: 'app-pre-authorization-worklist',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
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
  private readonly promptDialog = inject(PromptDialogService);

  readonly displayedColumns = [
    'requestNumber',
    'patient',
    'admission',
    'policyNumber',
    'insurer',
    'tpaCorporate',
    'requested',
    'approved',
    'status',
    'actions'
  ];
  readonly statusTone = STATUS_TONE;
  readonly statusLabels = STATUS_LABELS;

  loading = signal(false);
  requests = signal<PreAuthorizationRequest[]>([]);
  selectedPatient = signal<Patient | null>(null);
  submitting = signal(false);

  form = {
    policyNumber: '',
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
        insurerName: this.form.insurerName,
        tpaName: this.form.tpaName || null,
        corporateName: this.form.corporateName || null,
        requestedAmount: this.form.requestedAmount
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.selectedPatient.set(null);
          this.form = { policyNumber: '', insurerName: '', tpaName: '', corporateName: '', requestedAmount: 0 };
          this.notification.success('Pre authorization request raised.');
          this.refresh();
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to raise the request.');
        }
      });
  }

  raise(request: PreAuthorizationRequest): void {
    if (request.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Raise request ${request.requestNumber}`,
        message: 'Confirm the policy number, insurer, and requested amount to actually submit this request.',
        fields: [
          { key: 'policyNumber', label: 'Policy number', type: 'text', required: true },
          { key: 'insurerName', label: 'Insurer name', type: 'text', required: true, initialValue: request.insurerName ?? '' },
          { key: 'requestedAmount', label: 'Requested amount', type: 'number', required: true, min: 0 }
        ],
        confirmLabel: 'Raise'
      })
      .subscribe((values) => {
        if (!values || request.id === null) {
          return;
        }
        this.requestService
          .raise(request.id, {
            policyNumber: values['policyNumber'] as string,
            insurerName: values['insurerName'] as string,
            requestedAmount: values['requestedAmount'] as number
          })
          .subscribe({
            next: () => {
              this.notification.success('Request raised.');
              this.refresh();
            },
            error: (err) => this.notification.error(err.error?.message ?? 'Failed to raise the request.')
          });
      });
  }

  approve(request: PreAuthorizationRequest): void {
    if (request.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Approve request ${request.requestNumber}`,
        fields: [
          {
            key: 'approvedAmount',
            label: 'Approved amount',
            type: 'number',
            initialValue: request.requestedAmount,
            required: true,
            min: 0
          }
        ],
        confirmLabel: 'Approve'
      })
      .subscribe((values) => {
        if (!values || request.id === null) {
          return;
        }
        this.requestService.approve(request.id, values['approvedAmount'] as number).subscribe({
          next: () => {
            this.notification.success('Request approved.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to approve the request.')
        });
      });
  }

  reject(request: PreAuthorizationRequest): void {
    if (request.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Reject request ${request.requestNumber}`,
        fields: [{ key: 'reason', label: 'Rejection reason', type: 'textarea', required: true }],
        confirmLabel: 'Reject',
        destructive: true
      })
      .subscribe((values) => {
        if (!values || request.id === null) {
          return;
        }
        this.requestService.reject(request.id, values['reason'] as string).subscribe({
          next: () => {
            this.notification.success('Request rejected.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to reject the request.')
        });
      });
  }

  cancel(request: PreAuthorizationRequest): void {
    if (request.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Cancel request ${request.requestNumber}`,
        fields: [{ key: 'reason', label: 'Cancellation reason', type: 'textarea', required: true }],
        confirmLabel: 'Cancel request',
        destructive: true
      })
      .subscribe((values) => {
        if (!values || request.id === null) {
          return;
        }
        this.requestService.cancel(request.id, values['reason'] as string).subscribe({
          next: () => {
            this.notification.success('Request cancelled.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to cancel the request.')
        });
      });
  }
}
