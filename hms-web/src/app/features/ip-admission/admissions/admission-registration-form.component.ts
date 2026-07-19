import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
import { RoomType } from '../rooms/room-type.model';
import { RoomTypeService } from '../rooms/room-type.service';
import { AdmissionPaymentType, AdmissionRegistrationInput } from './admission.model';
import { AdmissionService } from './admission.service';

const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const DESCRIPTION_OF_CASE_OPTIONS = ['Non-Surgery', 'Surgery'];
const INSURANCE_TYPE_OPTIONS = ['None', 'Government', 'Private', 'Corporate TPA'];
const PATIENT_TYPE_OPTIONS = ['Normal', 'Senior Citizen', 'VIP'];
const PAYMENT_TYPE_OPTIONS: { value: AdmissionPaymentType; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'CORPORATE', label: 'Corporate' }
];

function nowAsDatetimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const EMPTY_FORM: Omit<AdmissionRegistrationInput, 'patientId'> = {
  admissionDate: '',
  roomTypeId: null,
  attenderName: null,
  relationType: null,
  fatherSpouseName: null,
  relationMobileNo: null,
  occupation: null,
  maritalStatus: null,
  periodOfStayDays: null,
  descriptionOfCase: 'Non-Surgery',
  referralDoctor: null,
  primaryConsultant: null,
  secondaryConsultant: null,
  paymentType: 'CASH',
  heightCm: null,
  weightKg: null,
  mlc: false,
  insuranceType: 'None',
  patientType: 'Normal',
  remarks: null,
  aadhaarNumber: null,
  ventilatorRequired: false,
  monitorRequired: false
};

/** IP Admission Advice (PDF p.3): register a new admission for the patient selected on the search screen. */
@Component({
  selector: 'app-admission-registration-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressBarModule,
    PageHeaderComponent
  ],
  templateUrl: './admission-registration-form.component.html',
  styleUrl: './admission-registration-form.component.scss'
})
export class AdmissionRegistrationFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly roomTypeService = inject(RoomTypeService);
  private readonly admissionService = inject(AdmissionService);
  private readonly notification = inject(NotificationService);

  readonly maritalStatusOptions = MARITAL_STATUS_OPTIONS;
  readonly descriptionOfCaseOptions = DESCRIPTION_OF_CASE_OPTIONS;
  readonly insuranceTypeOptions = INSURANCE_TYPE_OPTIONS;
  readonly patientTypeOptions = PATIENT_TYPE_OPTIONS;
  readonly paymentTypeOptions = PAYMENT_TYPE_OPTIONS;

  patient = signal<Patient | null>(null);
  roomTypes = signal<RoomType[]>([]);
  loading = signal(true);
  submitting = signal(false);

  photoPreviewUrl = signal<string | null>(null);
  private photoFile: File | null = null;

  form: Omit<AdmissionRegistrationInput, 'patientId'> = { ...EMPTY_FORM, admissionDate: nowAsDatetimeLocal() };

  constructor() {
    const patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    this.patientService.get(patientId).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load patient details.');
      }
    });
    this.roomTypeService.list().subscribe({ next: (types) => this.roomTypes.set(types) });
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => this.photoPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    const patient = this.patient();
    if (!patient || patient.id === null) {
      return;
    }
    this.submitting.set(true);
    this.admissionService.register({ patientId: patient.id, ...this.form }).subscribe({
      next: (admission) => {
        if (!this.photoFile || admission.id === null) {
          this.submitting.set(false);
          this.router.navigate(['/ip/admissions/new/success', admission.id]);
          return;
        }
        this.admissionService.uploadPhoto(admission.id, this.photoFile).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/ip/admissions/new/success', admission.id]);
          },
          error: () => {
            this.submitting.set(false);
            this.notification.error('Registered, but the photo upload failed.');
            this.router.navigate(['/ip/admissions/new/success', admission.id]);
          }
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error(err.error?.message ?? 'Failed to register the admission.');
      }
    });
  }
}
