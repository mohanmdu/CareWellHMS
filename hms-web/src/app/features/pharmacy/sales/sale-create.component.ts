import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
import { Patient } from '../../registration/patients/patient.model';
import { DrugBatch } from '../batches/drug-batch.model';
import { DrugBatchService } from '../batches/drug-batch.service';
import { PharmacySaleService } from './pharmacy-sale.service';

interface DraftLine {
  batchId: number;
  drugName: string;
  unitPrice: number;
  quantity: number;
  availableQty: number;
}

/**
 * Replaces AddDrugsByNF.jsp / Billingpending.jsp (migration doc §4.3) -
 * dispenses against real batch stock; the backend enforces the
 * insufficient-stock and concurrent-modification guards (risk R10), this
 * screen just surfaces whatever error comes back.
 */
@Component({
  selector: 'app-sale-create',
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
  templateUrl: './sale-create.component.html',
  styleUrl: './sale-create.component.scss'
})
export class SaleCreateComponent {
  private readonly batchService = inject(DrugBatchService);
  private readonly saleService = inject(PharmacySaleService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly lineColumns = ['drug', 'quantity', 'unitPrice', 'lineTotal', 'actions'];

  submitting = signal(false);
  selectedPatient = signal<Patient | null>(null);

  batches = signal<DrugBatch[]>([]);
  selectedBatchId: number | null = null;
  quantity = 1;
  draftLines = signal<DraftLine[]>([]);

  readonly total = computed(() => this.draftLines().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));

  constructor() {
    this.batchService.list().subscribe({
      next: (batches) => this.batches.set(batches.filter((b) => b.quantityOnHand > 0)),
      error: () => this.notification.error('Failed to load stock batches.')
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  changePatient(): void {
    this.selectedPatient.set(null);
    this.draftLines.set([]);
  }

  addLine(): void {
    const batch = this.batches().find((b) => b.id === this.selectedBatchId);
    if (!batch || this.quantity < 1) {
      return;
    }
    this.draftLines.update((lines) => [
      ...lines,
      {
        batchId: batch.id!,
        drugName: batch.drugName ?? '',
        unitPrice: batch.sellingPrice,
        quantity: this.quantity,
        availableQty: batch.quantityOnHand
      }
    ]);
    this.selectedBatchId = null;
    this.quantity = 1;
  }

  removeLine(index: number): void {
    this.draftLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  submit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || this.draftLines().length === 0) {
      return;
    }
    this.submitting.set(true);
    this.saleService
      .create({
        patientId: patient.id,
        items: this.draftLines().map((l) => ({ batchId: l.batchId, quantity: l.quantity }))
      })
      .subscribe({
        next: () => {
          this.notification.success('Dispensed successfully.');
          this.router.navigateByUrl('/pharmacy/sales');
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to dispense.');
        }
      });
  }
}
