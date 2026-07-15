import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { Patient } from '../../registration/patients/patient.model';
import { PharmacyBillEntryComponent } from './pharmacy-bill-entry.component';
import { PharmacyRequestListEntry } from './pharmacy-request.model';
import { PharmacyRequestService } from './pharmacy-request.service';
import { PharmacySaleSource } from './pharmacy-sale.model';

interface BillingContext {
  source: PharmacySaleSource;
  pharmacyRequestId: number | null;
}

/**
 * Pharmacy Request page for a chosen location: search-then-reveal a
 * registered Patient (reusing <app-patient-search>, same "Others" walk-in
 * convention already established by OP Direct Billing - every bill in this
 * app traces to a real registered Patient, never a free-text ad-hoc one),
 * then list their pending OP/IP requests (currently always empty - see
 * PharmacyRequest's class doc) alongside a "New Bill (Others)" action.
 * Both lead into the same PharmacyBillEntryComponent.
 */
@Component({
  selector: 'app-pharmacy-request-search',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatProgressBarModule, MatTableModule, EmptyStateComponent, PatientSearchComponent, PharmacyBillEntryComponent],
  templateUrl: './pharmacy-request-search.component.html',
  styleUrl: './pharmacy-request-search.component.scss'
})
export class PharmacyRequestSearchComponent {
  private readonly requestService = inject(PharmacyRequestService);
  private readonly notification = inject(NotificationService);

  readonly locationId = input.required<number>();

  readonly displayedColumns = ['source', 'createdAt', 'createdBy', 'actions'];

  patient = signal<Patient | null>(null);
  requests = signal<PharmacyRequestListEntry[]>([]);
  loadingRequests = signal(false);
  billingContext = signal<BillingContext | null>(null);

  selectPatient(patient: Patient): void {
    this.patient.set(patient);
    this.loadingRequests.set(true);
    this.requestService.list(patient.id!).subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loadingRequests.set(false);
      },
      error: () => {
        this.loadingRequests.set(false);
        this.notification.error('Failed to load pending pharmacy requests.');
      }
    });
  }

  billForRequest(request: PharmacyRequestListEntry): void {
    this.billingContext.set({ source: request.source, pharmacyRequestId: request.id });
  }

  billOthers(): void {
    this.billingContext.set({ source: 'OTHERS', pharmacyRequestId: null });
  }

  onBilled(): void {
    this.reset();
  }

  reset(): void {
    this.patient.set(null);
    this.requests.set([]);
    this.billingContext.set(null);
  }
}
