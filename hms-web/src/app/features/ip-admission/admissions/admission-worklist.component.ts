import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../registration/patients/patient.model';
import { PatientService } from '../../registration/patients/patient.service';
import { Room } from '../rooms/room.model';
import { RoomService } from '../rooms/room.service';
import { Admission } from './admission.model';
import { AdmissionService } from './admission.service';

/**
 * Replaces PatientIPRegistration.jsp (admission) + IPBillingCategory/Component
 * screens (advance/discharge) - migration doc §4.2. Ward charges during the
 * stay are billed through the existing generic Invoice screens
 * (Billing > New Invoice), not duplicated here.
 */
@Component({
  selector: 'app-admission-worklist',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admission-worklist.component.html'
})
export class AdmissionWorklistComponent {
  private readonly patientService = inject(PatientService);
  private readonly roomService = inject(RoomService);
  private readonly admissionService = inject(AdmissionService);

  errorMessage = signal<string | null>(null);
  admissions = signal<Admission[]>([]);
  availableRooms = signal<Room[]>([]);

  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  selectedRoomId: number | null = null;

  constructor() {
    this.refresh();
    this.roomService.list().subscribe({
      next: (rooms) => this.availableRooms.set(rooms.filter((r) => !r.occupied))
    });
  }

  refresh(): void {
    this.admissionService.list().subscribe({
      next: (admissions) => this.admissions.set(admissions),
      error: () => this.errorMessage.set('Failed to load admissions.')
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

  admit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || !this.selectedRoomId) return;
    this.admissionService.admit(patient.id, this.selectedRoomId).subscribe({
      next: () => {
        this.selectedPatient.set(null);
        this.selectedRoomId = null;
        this.searchQuery = '';
        this.refresh();
        this.roomService.list().subscribe({ next: (rooms) => this.availableRooms.set(rooms.filter((r) => !r.occupied)) });
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to admit patient.')
    });
  }

  addAdvance(admission: Admission): void {
    if (admission.id === null) return;
    const amountStr = prompt('Advance amount?') ?? '0';
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;
    this.admissionService.addAdvancePayment(admission.id, amount).subscribe({
      next: () => this.refresh(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to record advance payment.')
    });
  }

  discharge(admission: Admission): void {
    if (admission.id === null) return;
    const totalBilledStr = prompt('Total billed amount for this stay?') ?? '0';
    const totalBilled = Number(totalBilledStr);
    const dischargeSummary = prompt('Discharge summary?') ?? '';
    this.admissionService.discharge(admission.id, totalBilled, dischargeSummary).subscribe({
      next: () => {
        this.refresh();
        this.roomService.list().subscribe({ next: (rooms) => this.availableRooms.set(rooms.filter((r) => !r.occupied)) });
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to discharge patient.')
    });
  }
}
