import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
import { InsuranceClaim, InsuranceClaimType } from './insurance-claim.model';
import { InsuranceClaimService } from './insurance-claim.service';

/**
 * Replaces IPAction.risePreAuthorization/riseEnhancement + InsuranceApproval.jsp
 * (migration doc §4.5). Insurance is given its own bounded context here per
 * the doc's target-architecture recommendation, even though the legacy app
 * buried it inside IPAction.
 */
@Component({
  selector: 'app-insurance-claim-worklist',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './insurance-claim-worklist.component.html'
})
export class InsuranceClaimWorklistComponent {
  private readonly patientService = inject(PatientService);
  private readonly claimService = inject(InsuranceClaimService);

  errorMessage = signal<string | null>(null);
  claims = signal<InsuranceClaim[]>([]);

  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);

  form = { policyNumber: '', insurerName: '', claimType: 'PRE_AUTHORIZATION' as InsuranceClaimType, requestedAmount: 0 };

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.claimService.list().subscribe({
      next: (claims) => this.claims.set(claims),
      error: () => this.errorMessage.set('Failed to load insurance claims.')
    });
  }

  search(): void {
    this.patientService.search(this.searchQuery).subscribe({
      next: (patients) => this.searchResults.set(patients),
      error: () => this.errorMessage.set('Patient search failed.')
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  submit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || !this.form.policyNumber.trim() || !this.form.insurerName.trim()) {
      return;
    }
    this.claimService.create({ patientId: patient.id, ...this.form }).subscribe({
      next: () => {
        this.selectedPatient.set(null);
        this.searchQuery = '';
        this.form = { policyNumber: '', insurerName: '', claimType: 'PRE_AUTHORIZATION', requestedAmount: 0 };
        this.refresh();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to raise claim.')
    });
  }

  approve(claim: InsuranceClaim): void {
    if (claim.id === null) return;
    const amountStr = prompt('Approved amount?', String(claim.requestedAmount)) ?? '0';
    this.claimService.approve(claim.id, Number(amountStr)).subscribe({
      next: () => this.refresh(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to approve claim.')
    });
  }

  reject(claim: InsuranceClaim): void {
    if (claim.id === null) return;
    const reason = prompt('Rejection reason?') ?? '';
    this.claimService.reject(claim.id, reason).subscribe({
      next: () => this.refresh(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to reject claim.')
    });
  }

  cancel(claim: InsuranceClaim): void {
    if (claim.id === null) return;
    const reason = prompt('Cancellation reason?') ?? '';
    this.claimService.cancel(claim.id, reason).subscribe({
      next: () => this.refresh(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to cancel claim.')
    });
  }
}
