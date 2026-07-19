import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Consultant } from '../masters-admin/consultants/consultant.model';
import { Department } from '../masters-admin/departments/department.model';
import { IcdCodeService } from './icd-code.service';
import {
  DIAGNOSIS_SEVERITIES,
  DIAGNOSIS_STATUSES,
  DIAGNOSIS_TYPES,
  DiagnosisSeverity,
  DiagnosisStatus,
  DiagnosisType,
  IcdCode,
  ICD_VERSIONS,
  IcdVersion,
  PatientDiagnosis,
  PatientDiagnosisInput
} from './icd.model';

export interface IcdDiagnosisFormDialogData {
  diagnosis?: PatientDiagnosis;
  readonlyMode?: boolean;
  departments: Department[];
  consultants: Consultant[];
}

/**
 * Assign/Edit/View ICD Diagnosis - one dialog for all three, matching the
 * ConsultantFormDialogComponent shape. View reuses the same form disabled
 * (readonlyMode) rather than a second bespoke read-only component.
 */
@Component({
  selector: 'app-icd-diagnosis-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './icd-diagnosis-form-dialog.component.html',
  styleUrl: './icd-diagnosis-form-dialog.component.scss'
})
export class IcdDiagnosisFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<IcdDiagnosisFormDialogComponent, PatientDiagnosisInput>);
  private readonly data = inject<IcdDiagnosisFormDialogData>(MAT_DIALOG_DATA);
  private readonly icdCodeService = inject(IcdCodeService);
  private readonly codeSearchTerms = new Subject<string>();

  readonly isEdit = !!this.data.diagnosis;
  readonly readonlyMode = !!this.data.readonlyMode;
  readonly departments = this.data.departments;
  readonly consultants = this.data.consultants;

  readonly icdVersions = ICD_VERSIONS;
  readonly diagnosisTypes = DIAGNOSIS_TYPES;
  readonly diagnosisStatuses = DIAGNOSIS_STATUSES;
  readonly diagnosisSeverities = DIAGNOSIS_SEVERITIES;

  version = signal<IcdVersion>((this.data.diagnosis?.icdVersion as IcdVersion) ?? 'ICD_10');
  codeQuery = signal(this.data.diagnosis ? `${this.data.diagnosis.icdCode} - ${this.data.diagnosis.diseaseName}` : '');
  codeResults = signal<IcdCode[]>([]);
  selectedCode = signal<IcdCode | null>(null);

  readonly diseaseName = computed(() => this.selectedCode()?.diseaseName ?? this.data.diagnosis?.diseaseName ?? '');
  readonly chapter = computed(() => this.selectedCode()?.chapter ?? '');
  readonly category = computed(() => this.selectedCode()?.category ?? '');

  form = {
    diagnosisType: this.data.diagnosis?.diagnosisType ?? ('PRIMARY' as DiagnosisType),
    departmentId: this.data.diagnosis?.departmentId ?? (null as number | null),
    consultantId: this.data.diagnosis?.consultantId ?? (null as number | null),
    diagnosisDate: this.data.diagnosis?.diagnosisDate ?? new Date().toISOString().slice(0, 10),
    status: this.data.diagnosis?.status ?? ('ACTIVE' as DiagnosisStatus),
    severity: this.data.diagnosis?.severity ?? (null as DiagnosisSeverity | null),
    comments: this.data.diagnosis?.comments ?? '',
    clinicalNotes: this.data.diagnosis?.clinicalNotes ?? ''
  };

  constructor() {
    this.codeSearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.icdCodeService.search(query, this.version())),
        takeUntilDestroyed()
      )
      .subscribe((results) => this.codeResults.set(results));
  }

  onVersionChange(version: IcdVersion): void {
    this.version.set(version);
    this.codeQuery.set('');
    this.selectedCode.set(null);
    this.codeResults.set([]);
  }

  onCodeQueryChange(value: string): void {
    this.codeQuery.set(value);
    this.selectedCode.set(null);
    if (value.trim().length >= 2) {
      this.codeSearchTerms.next(value.trim());
    } else {
      this.codeResults.set([]);
    }
  }

  selectCode(code: IcdCode): void {
    this.selectedCode.set(code);
    this.codeQuery.set(`${code.code} - ${code.diseaseName}`);
    this.codeResults.set([]);
  }

  get isValid(): boolean {
    const hasCode = this.selectedCode() !== null || (this.isEdit && !!this.data.diagnosis?.icdCodeId);
    return hasCode && !!this.form.diagnosisDate;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    const icdCodeId = this.selectedCode()?.id ?? this.data.diagnosis!.icdCodeId;
    this.dialogRef.close({
      icdCodeId,
      diagnosisType: this.form.diagnosisType,
      departmentId: this.form.departmentId,
      consultantId: this.form.consultantId,
      diagnosisDate: this.form.diagnosisDate,
      status: this.form.status,
      severity: this.form.severity,
      comments: this.form.comments.trim() || null,
      clinicalNotes: this.form.clinicalNotes.trim() || null
    });
  }
}
