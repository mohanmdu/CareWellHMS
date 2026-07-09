import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { BillingItem } from '../../billing-receipts/items/billing-item.model';
import { BillingItemService } from '../../billing-receipts/items/billing-item.service';
import { Patient } from '../../registration/patients/patient.model';
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
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    PageHeaderComponent,
    PatientSearchComponent,
    EmptyStateComponent
  ],
  templateUrl: './requisition-create.component.html',
  styleUrl: './requisition-create.component.scss'
})
export class RequisitionCreateComponent {
  private readonly billingItemService = inject(BillingItemService);
  private readonly requisitionService = inject(LabRequisitionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly itemColumns = ['test', 'specimen', 'actions'];

  submitting = signal(false);
  selectedPatient = signal<Patient | null>(null);

  billingItems = signal<BillingItem[]>([]);
  selectedBillingItemId: number | null = null;
  specimenType = '';
  draftItems = signal<DraftItem[]>([]);
  notes = '';

  constructor() {
    this.billingItemService.list().subscribe({
      next: (items) => this.billingItems.set(items.filter((i) => i.active)),
      error: () => this.notification.error('Failed to load lab test catalog.')
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  changePatient(): void {
    this.selectedPatient.set(null);
    this.draftItems.set([]);
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
    this.selectedBillingItemId = null;
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
    this.submitting.set(true);
    this.requisitionService
      .create({
        patientId: patient.id,
        appointmentId: null,
        notes: this.notes,
        items: this.draftItems().map((i) => ({ billingItemId: i.billingItemId, specimenType: i.specimenType }))
      })
      .subscribe({
        next: () => {
          this.notification.success('Requisition created.');
          this.router.navigateByUrl('/lab/requisitions');
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to create requisition.');
        }
      });
  }
}
