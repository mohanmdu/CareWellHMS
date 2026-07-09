import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { Patient } from '../../registration/patients/patient.model';
import { InsuranceClaim, InsuranceClaimType } from './insurance-claim.model';
import { InsuranceClaimService } from './insurance-claim.service';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral'
};

/**
 * Replaces IPAction.risePreAuthorization/riseEnhancement + InsuranceApproval.jsp
 * (migration doc §4.5). Insurance is given its own bounded context here per
 * the doc's target-architecture recommendation, even though the legacy app
 * buried it inside IPAction.
 */
@Component({
  selector: 'app-insurance-claim-worklist',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    PatientSearchComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './insurance-claim-worklist.component.html',
  styleUrl: './insurance-claim-worklist.component.scss'
})
export class InsuranceClaimWorklistComponent {
  private readonly claimService = inject(InsuranceClaimService);
  private readonly notification = inject(NotificationService);
  private readonly promptDialog = inject(PromptDialogService);

  readonly displayedColumns = [
    'claimNumber',
    'patient',
    'insurer',
    'type',
    'requested',
    'approved',
    'status',
    'actions'
  ];
  readonly statusTone = STATUS_TONE;

  loading = signal(false);
  claims = signal<InsuranceClaim[]>([]);
  selectedPatient = signal<Patient | null>(null);
  submitting = signal(false);

  form = {
    policyNumber: '',
    insurerName: '',
    claimType: 'PRE_AUTHORIZATION' as InsuranceClaimType,
    requestedAmount: 0
  };

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.claimService.list().subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load insurance claims.');
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
    this.claimService.create({ patientId: patient.id, ...this.form }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.selectedPatient.set(null);
        this.form = { policyNumber: '', insurerName: '', claimType: 'PRE_AUTHORIZATION', requestedAmount: 0 };
        this.notification.success('Claim raised.');
        this.refresh();
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error(err.error?.message ?? 'Failed to raise claim.');
      }
    });
  }

  approve(claim: InsuranceClaim): void {
    if (claim.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Approve claim ${claim.claimNumber}`,
        fields: [
          {
            key: 'approvedAmount',
            label: 'Approved amount',
            type: 'number',
            initialValue: claim.requestedAmount,
            required: true,
            min: 0
          }
        ],
        confirmLabel: 'Approve'
      })
      .subscribe((values) => {
        if (!values || claim.id === null) {
          return;
        }
        this.claimService.approve(claim.id, values['approvedAmount'] as number).subscribe({
          next: () => {
            this.notification.success('Claim approved.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to approve claim.')
        });
      });
  }

  reject(claim: InsuranceClaim): void {
    if (claim.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Reject claim ${claim.claimNumber}`,
        fields: [{ key: 'reason', label: 'Rejection reason', type: 'textarea', required: true }],
        confirmLabel: 'Reject',
        destructive: true
      })
      .subscribe((values) => {
        if (!values || claim.id === null) {
          return;
        }
        this.claimService.reject(claim.id, values['reason'] as string).subscribe({
          next: () => {
            this.notification.success('Claim rejected.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to reject claim.')
        });
      });
  }

  cancel(claim: InsuranceClaim): void {
    if (claim.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Cancel claim ${claim.claimNumber}`,
        fields: [{ key: 'reason', label: 'Cancellation reason', type: 'textarea', required: true }],
        confirmLabel: 'Cancel claim',
        destructive: true
      })
      .subscribe((values) => {
        if (!values || claim.id === null) {
          return;
        }
        this.claimService.cancel(claim.id, values['reason'] as string).subscribe({
          next: () => {
            this.notification.success('Claim cancelled.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to cancel claim.')
        });
      });
  }
}
