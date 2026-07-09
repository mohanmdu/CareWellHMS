import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Patient } from '../../../features/registration/patients/patient.model';
import { PatientService } from '../../../features/registration/patients/patient.service';
import { NotificationService } from '../../services/notification.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * Search-by-name patient picker, shared by every screen that starts a
 * workflow against a patient (invoicing, lab requisitions, pharmacy
 * dispense, IP admission, insurance claims, appointment booking). Each of
 * those screens previously hand-rolled an identical search form + result
 * list; parents mount this only while no patient is selected and remove it
 * once one is (see invoice-create.component.html), which resets its state
 * for free instead of needing an explicit reset() method.
 */
@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, EmptyStateComponent],
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);

  readonly patientSelected = output<Patient>();

  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  searched = signal(false);

  search(): void {
    this.patientService.search(this.searchQuery).subscribe({
      next: (patients) => {
        this.searchResults.set(patients);
        this.searched.set(true);
      },
      error: () => this.notification.error('Patient search failed.')
    });
  }

  select(patient: Patient): void {
    this.patientSelected.emit(patient);
  }
}
