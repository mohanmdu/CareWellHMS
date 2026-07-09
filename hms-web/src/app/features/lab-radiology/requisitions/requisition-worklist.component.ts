import { Component, inject, signal } from '@angular/core';
import { LabRequisition, LabRequisitionItem } from './lab-requisition.model';
import { LabRequisitionService } from './lab-requisition.service';

/**
 * Replaces the legacy labEntrySaveAction (byPass=1 draft save, byPass=2
 * approve) with explicit per-item actions (migration doc §4.4).
 */
@Component({
  selector: 'app-requisition-worklist',
  standalone: true,
  templateUrl: './requisition-worklist.component.html'
})
export class RequisitionWorklistComponent {
  private readonly service = inject(LabRequisitionService);

  requisitions = signal<LabRequisition[]>([]);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (requisitions) => this.requisitions.set(requisitions),
      error: () => this.errorMessage.set('Failed to load requisitions.')
    });
  }

  collectSpecimen(requisition: LabRequisition, item: LabRequisitionItem): void {
    if (requisition.id === null || item.id === null) return;
    this.service.collectSpecimen(requisition.id, item.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to collect specimen.')
    });
  }

  enterResult(requisition: LabRequisition, item: LabRequisitionItem): void {
    if (requisition.id === null || item.id === null) return;
    const resultValue = prompt('Result value?') ?? '';
    const normalRange = prompt('Normal range?') ?? '';
    this.service.enterResult(requisition.id, item.id, resultValue, normalRange).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to enter result.')
    });
  }

  approve(requisition: LabRequisition, item: LabRequisitionItem): void {
    if (requisition.id === null || item.id === null) return;
    this.service.approve(requisition.id, item.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to approve result.')
    });
  }
}
