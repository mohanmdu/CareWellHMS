import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
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
  imports: [FormsModule],
  templateUrl: './sale-create.component.html'
})
export class SaleCreateComponent {
  private readonly patientService = inject(PatientService);
  private readonly batchService = inject(DrugBatchService);
  private readonly saleService = inject(PharmacySaleService);
  private readonly router = inject(Router);

  errorMessage = signal<string | null>(null);

  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);

  batches = signal<DrugBatch[]>([]);
  selectedBatchId: number | null = null;
  quantity = 1;
  draftLines = signal<DraftLine[]>([]);

  readonly total = computed(() => this.draftLines().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));

  constructor() {
    this.batchService.list().subscribe({
      next: (batches) => this.batches.set(batches.filter((b) => b.quantityOnHand > 0)),
      error: () => this.errorMessage.set('Failed to load stock batches.')
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

  addLine(): void {
    const batch = this.batches().find((b) => b.id === this.selectedBatchId);
    if (!batch || this.quantity < 1) {
      return;
    }
    this.draftLines.update((lines) => [
      ...lines,
      { batchId: batch.id!, drugName: batch.drugName ?? '', unitPrice: batch.sellingPrice, quantity: this.quantity, availableQty: batch.quantityOnHand }
    ]);
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
    this.errorMessage.set(null);
    this.saleService
      .create({
        patientId: patient.id,
        items: this.draftLines().map((l) => ({ batchId: l.batchId, quantity: l.quantity }))
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/pharmacy/sales'),
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to dispense.')
      });
  }
}
