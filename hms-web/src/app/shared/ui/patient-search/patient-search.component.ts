import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Patient } from '../../../features/registration/patients/patient.model';
import { PatientService } from '../../../features/registration/patients/patient.service';
import { NotificationService } from '../../services/notification.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * Search-by-ID/name/mobile patient picker, shared by every screen that
 * starts a workflow against a patient (invoicing, lab requisitions, pharmacy
 * dispense, IP admission, insurance claims, appointment booking). Each of
 * those screens previously hand-rolled an identical search form + result
 * list; parents mount this only while no patient is selected and remove it
 * once one is (see invoice-create.component.html), which resets its state
 * for free instead of needing an explicit reset() method.
 *
 * Filters live as you type (debounced) - the Search button/Enter key still
 * work too, for anyone who types fast and hits enter before the debounce.
 */
@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    EmptyStateComponent
  ],
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);
  private readonly searchTerms = new Subject<string>();

  readonly patientSelected = output<Patient>();

  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  searched = signal(false);
  loading = signal(false);

  constructor() {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.loading.set(true);
          return this.patientService.search(query);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (patients) => {
          this.searchResults.set(patients);
          this.searched.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Patient search failed.');
        }
      });
  }

  onQueryChange(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      this.searchResults.set([]);
      this.searched.set(false);
      return;
    }
    this.searchTerms.next(query);
  }

  search(): void {
    this.onQueryChange();
  }

  select(patient: Patient): void {
    this.patientSelected.emit(patient);
  }
}
