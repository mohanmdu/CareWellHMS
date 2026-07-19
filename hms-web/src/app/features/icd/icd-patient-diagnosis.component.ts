import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../shared/services/notification.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { Consultant } from '../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../masters-admin/consultants/consultant.service';
import { Department } from '../masters-admin/departments/department.model';
import { DepartmentService } from '../masters-admin/departments/department.service';
import { Patient } from '../registration/patients/patient.model';
import { PatientService } from '../registration/patients/patient.service';
import { IcdDiagnosisFormDialogComponent } from './icd-diagnosis-form-dialog.component';
import { PatientDiagnosis, PatientVisitSummary } from './icd.model';
import { PatientDiagnosisService } from './patient-diagnosis.service';
import { PatientVisitSummaryService } from './patient-visit-summary.service';

/**
 * Patient ICD Code Details (screen 2 of 3): patient summary card + the
 * Assigned ICD Codes table. Reached via /icd/patients/:patientId (from ICD
 * Code Search's "Manage ICD Codes", or a direct/refreshed URL) - visit
 * context (Department/Consultant/OP-IP/date) is re-derived via
 * PatientVisitSummaryService rather than passed through router state, so a
 * hard refresh here still works.
 */
@Component({
  selector: 'app-icd-patient-diagnosis',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './icd-patient-diagnosis.component.html',
  styleUrl: './icd-patient-diagnosis.component.scss'
})
export class IcdPatientDiagnosisComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly visitSummaryService = inject(PatientVisitSummaryService);
  private readonly diagnosisService = inject(PatientDiagnosisService);
  private readonly departmentService = inject(DepartmentService);
  private readonly consultantService = inject(ConsultantService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notification = inject(NotificationService);

  private readonly patientId = Number(this.route.snapshot.paramMap.get('patientId'));

  patient = signal<Patient | null>(null);
  visitSummary = signal<PatientVisitSummary | null>(null);
  diagnoses = signal<PatientDiagnosis[]>([]);
  departments = signal<Department[]>([]);
  consultants = signal<Consultant[]>([]);
  loading = signal(true);

  readonly diagnosisCount = computed(() => this.diagnoses().length);

  constructor() {
    this.patientService.get(this.patientId).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        if (patient.registrationNumber) {
          this.visitSummaryService.search(patient.registrationNumber).subscribe((rows) => {
            this.visitSummary.set(rows.find((r) => r.patientId === this.patientId) ?? null);
          });
        }
      },
      error: () => this.notification.error('Failed to load patient details.')
    });
    this.departmentService.list().subscribe((departments) => this.departments.set(departments.filter((d) => d.active)));
    this.consultantService.list().subscribe((consultants) => this.consultants.set(consultants.filter((c) => c.active)));
    this.refreshDiagnoses();
  }

  refreshDiagnoses(): void {
    this.loading.set(true);
    this.diagnosisService.findByPatient(this.patientId).subscribe({
      next: (diagnoses) => {
        this.diagnoses.set(diagnoses);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load assigned ICD codes.');
      }
    });
  }

  assignIcdCode(): void {
    this.openFormDialog();
  }

  editDiagnosis(diagnosis: PatientDiagnosis): void {
    this.openFormDialog(diagnosis, false);
  }

  viewDiagnosis(diagnosis: PatientDiagnosis): void {
    this.openFormDialog(diagnosis, true);
  }

  private openFormDialog(diagnosis?: PatientDiagnosis, readonlyMode = false): void {
    this.dialog
      .open(IcdDiagnosisFormDialogComponent, {
        width: '760px',
        maxWidth: '95vw',
        data: { diagnosis, readonlyMode, departments: this.departments(), consultants: this.consultants() }
      })
      .afterClosed()
      .subscribe((input) => {
        if (!input) {
          return;
        }
        const save$ = diagnosis ? this.diagnosisService.update(diagnosis.id, input) : this.diagnosisService.create(this.patientId, input);
        save$.subscribe({
          next: () => {
            this.notification.success(diagnosis ? 'Diagnosis updated.' : 'ICD code assigned.');
            this.refreshDiagnoses();
          },
          error: () => this.notification.error('Failed to save the diagnosis.')
        });
      });
  }

  deleteDiagnosis(diagnosis: PatientDiagnosis): void {
    this.confirmDialog
      .confirm({
        title: `Remove ${diagnosis.icdCode} - ${diagnosis.diseaseName}?`,
        message: 'This diagnosis will be removed from the patient\'s assigned ICD codes.',
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.diagnosisService.delete(diagnosis.id).subscribe({
          next: () => {
            this.notification.success('Diagnosis removed.');
            this.refreshDiagnoses();
          },
          error: () => this.notification.error('Failed to remove the diagnosis.')
        });
      });
  }

  back(): void {
    this.router.navigate(['/icd/search']);
  }
}
