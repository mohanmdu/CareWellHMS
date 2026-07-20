import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { LabTestEntry, LabTestResult, SPECIMEN_TYPES } from './lab-test-entry.model';
import { LabTestEntryService } from './lab-test-entry.service';

interface TestGroup {
  subCategoryName: string;
  results: LabTestResult[];
}

/**
 * Lab Test Entry: results grid grouped by test (Sub-Category), one row per
 * measurable component. Save persists without changing status; Draft Copy
 * additionally marks the report Draft; Approve locks it (server rejects
 * further edits once APPROVED - see LabTestEntryService.applyFieldsAndResults).
 * An already-APPROVED entry redirects straight to the read-only print sheet
 * instead of rendering this editable form.
 */
@Component({
  selector: 'app-lab-test-entry',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCheckboxModule, MatProgressBarModule],
  templateUrl: './lab-test-entry.component.html',
  styleUrl: './lab-test-entry.component.scss'
})
export class LabTestEntryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(LabTestEntryService);
  private readonly notification = inject(NotificationService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly specimenTypeOptions = SPECIMEN_TYPES;

  loading = signal(true);
  saving = signal(false);
  entry = signal<LabTestEntry | null>(null);
  selectedSpecimenTypes = signal<Set<string>>(new Set());
  reportedDate = '';
  remarks = '';
  resultValues = new Map<number, string>();
  abnormalFlags = new Map<number, boolean>();

  readonly testGroups = computed<TestGroup[]>(() => {
    const e = this.entry();
    if (!e) {
      return [];
    }
    const byGroup = new Map<string, LabTestResult[]>();
    for (const result of e.results) {
      const list = byGroup.get(result.subCategoryName) ?? [];
      list.push(result);
      byGroup.set(result.subCategoryName, list);
    }
    return Array.from(byGroup.entries()).map(([subCategoryName, results]) => ({ subCategoryName, results }));
  });

  constructor() {
    this.service.getById(this.id).subscribe({
      next: (entry) => {
        if (entry.status === 'APPROVED') {
          this.router.navigate(['/lab/test-entries', this.id, 'print']);
          return;
        }
        this.entry.set(entry);
        this.selectedSpecimenTypes.set(new Set(entry.specimenTypes ? entry.specimenTypes.split(',').filter((v) => v) : []));
        this.reportedDate = entry.reportedDate ? entry.reportedDate.slice(0, 16) : '';
        this.remarks = entry.remarks ?? '';
        for (const result of entry.results) {
          this.resultValues.set(result.componentId, result.resultValue ?? '');
          this.abnormalFlags.set(result.componentId, result.abnormal);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the lab test entry.');
      }
    });
  }

  isSpecimenSelected(type: string): boolean {
    return this.selectedSpecimenTypes().has(type);
  }

  toggleSpecimen(type: string, checked: boolean): void {
    const set = new Set(this.selectedSpecimenTypes());
    if (checked) {
      set.add(type);
    } else {
      set.delete(type);
    }
    this.selectedSpecimenTypes.set(set);
  }

  onAbnormalChange(componentId: number, checked: boolean): void {
    this.abnormalFlags.set(componentId, checked);
  }

  getResultValue(componentId: number): string {
    return this.resultValues.get(componentId) ?? '';
  }

  setResultValue(componentId: number, value: string): void {
    this.resultValues.set(componentId, value);
  }

  private buildSaveInput() {
    return {
      specimenTypes: Array.from(this.selectedSpecimenTypes()),
      reportedDate: this.reportedDate || null,
      remarks: this.remarks.trim() || null,
      results: Array.from(this.resultValues.entries()).map(([componentId, resultValue]) => ({
        componentId,
        resultValue: resultValue.trim() || null,
        abnormal: this.abnormalFlags.get(componentId) ?? false
      }))
    };
  }

  save(): void {
    this.saving.set(true);
    this.service.save(this.id, this.buildSaveInput()).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Saved.');
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save.');
      }
    });
  }

  saveDraft(): void {
    this.saving.set(true);
    this.service.saveDraft(this.id, this.buildSaveInput()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/lab/test-entries/draft']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save as draft.');
      }
    });
  }

  approve(): void {
    this.saving.set(true);
    this.service.approve(this.id, this.buildSaveInput()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/lab/test-entries', this.id, 'print']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to approve.');
      }
    });
  }
}
