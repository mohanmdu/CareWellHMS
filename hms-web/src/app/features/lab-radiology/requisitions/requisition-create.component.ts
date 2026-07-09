import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BillingItem } from '../../billing-receipts/items/billing-item.model';
import { BillingItemService } from '../../billing-receipts/items/billing-item.service';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
import { LabRequisitionService } from './lab-requisition.service';

interface DraftItem {
  billingItemId: number;
  testName: string;
  specimenType: string;
}

/**
 * Replaces the legacy requisitionInput/requisitionInputforIP/requisitionInputOP
 * JSPs (migration doc §4.4) with one screen.
 */
@Component({
  selector: 'app-requisition-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './requisition-create.component.html'
})
export class RequisitionCreateComponent {
  private readonly patientService = inject(PatientService);
  private readonly billingItemService = inject(BillingItemService);
  private readonly requisitionService = inject(LabRequisitionService);
  private readonly router = inject(Router);

  errorMessage = signal<string | null>(null);

  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);

  billingItems = signal<BillingItem[]>([]);
  selectedBillingItemId: number | null = null;
  specimenType = '';
  draftItems = signal<DraftItem[]>([]);
  notes = '';

  constructor() {
    this.billingItemService.list().subscribe({
      next: (items) => this.billingItems.set(items.filter((i) => i.active)),
      error: () => this.errorMessage.set('Failed to load lab test catalog.')
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

  addItem(): void {
    const item = this.billingItems().find((i) => i.id === this.selectedBillingItemId);
    if (!item) {
      return;
    }
    this.draftItems.update((items) => [
      ...items,
      { billingItemId: item.id!, testName: item.name, specimenType: this.specimenType || 'N/A' }
    ]);
    this.specimenType = '';
  }

  removeItem(index: number): void {
    this.draftItems.update((items) => items.filter((_, i) => i !== index));
  }

  submit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || this.draftItems().length === 0) {
      return;
    }
    this.requisitionService
      .create({
        patientId: patient.id,
        appointmentId: null,
        notes: this.notes,
        items: this.draftItems().map((i) => ({ billingItemId: i.billingItemId, specimenType: i.specimenType }))
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/lab/requisitions'),
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create requisition.')
      });
  }
}
