import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { AdviseType, DischargeAdviseDrug, DischargeSummary, DischargeSurgeryProcedure } from './discharge-summary.model';
import { DischargeSummaryService } from './discharge-summary.service';

const BLANK_DRUG: Omit<DischargeAdviseDrug, 'id'> = {
  drugName: '',
  adviseType: 'REGULAR',
  dose: '',
  morning: '',
  afternoon: '',
  evening: '',
  night: '',
  route: '',
  relationshipWithMeal: '',
  duration: ''
};

/**
 * Discharge Summary clinical entry form: one big single-sheet document
 * matching the reference's continuous scroll (Demographics -> History ->
 * Clinical Examination -> Investigations -> Surgery Notes -> Advise Drug ->
 * Discharge Advice). Bound with plain ngModel against `summary` (a plain
 * object, not a signal) once loaded, so two-way binding stays safe - only
 * the `loading`/`saving` gates are signals.
 */
@Component({
  selector: 'app-discharge-summary-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule
  ],
  templateUrl: './discharge-summary-form.component.html',
  styleUrl: './discharge-summary-form.component.scss'
})
export class DischargeSummaryFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DischargeSummaryService);
  private readonly notification = inject(NotificationService);

  private readonly admissionId = Number(this.route.snapshot.paramMap.get('admissionId'));

  readonly adviseTypes: AdviseType[] = ['REGULAR', 'SOS'];

  loading = signal(true);
  saving = signal(false);
  summary: DischargeSummary | null = null;

  newDrug: Omit<DischargeAdviseDrug, 'id'> = { ...BLANK_DRUG };

  constructor() {
    this.service.getByAdmission(this.admissionId).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the discharge summary.');
      }
    });
  }

  addListItem(list: string[]): void {
    list.push('');
  }

  removeListItem(list: string[], index: number): void {
    list.splice(index, 1);
  }

  addProcedure(): void {
    if (!this.summary) {
      return;
    }
    const entry: DischargeSurgeryProcedure = {
      id: null,
      procedureName: '',
      surgeonName: '',
      assistantSurgeonName: '',
      anaesthetistName: '',
      dateOfSurgery: null
    };
    this.summary.surgeryProcedures.push(entry);
  }

  removeProcedure(index: number): void {
    this.summary?.surgeryProcedures.splice(index, 1);
  }

  addDrug(): void {
    if (!this.summary || !this.newDrug.drugName.trim()) {
      return;
    }
    this.summary.adviseDrugs.push({ id: null, ...this.newDrug });
    this.newDrug = { ...BLANK_DRUG };
  }

  removeDrug(index: number): void {
    this.summary?.adviseDrugs.splice(index, 1);
  }

  save(): void {
    if (!this.summary) {
      return;
    }
    this.saving.set(true);
    const payload: DischargeSummary = {
      ...this.summary,
      consultants: this.summary.consultants.filter((v) => v.trim().length > 0),
      diagnosis: this.summary.diagnosis.filter((v) => v.trim().length > 0),
      procedures: this.summary.procedures.filter((v) => v.trim().length > 0),
      impression: this.summary.impression.filter((v) => v.trim().length > 0),
      emergencySymptoms: this.summary.emergencySymptoms.filter((v) => v.trim().length > 0)
    };
    this.service.save(this.admissionId, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Discharge summary saved.');
        this.router.navigate(['/ip/discharge-summary']);
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to save the discharge summary.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/ip/discharge-summary']);
  }
}
