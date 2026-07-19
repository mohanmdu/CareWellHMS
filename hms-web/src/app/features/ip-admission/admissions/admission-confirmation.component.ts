import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { Admission } from './admission.model';
import { AdmissionService } from './admission.service';

/** Admission confirmation (PDF p.9): "The Patient {name} (In-Patient ID:{IPID}) has been admitted as In-Patient in {Ward Type} - {Room No}." */
@Component({
  selector: 'app-admission-confirmation',
  standalone: true,
  imports: [MatButtonModule, MatProgressBarModule, RouterLink],
  templateUrl: './admission-confirmation.component.html',
  styleUrl: './admission-confirmation.component.scss'
})
export class AdmissionConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admissionService = inject(AdmissionService);
  private readonly notification = inject(NotificationService);

  admission = signal<Admission | null>(null);
  loading = signal(true);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.admissionService.get(id).subscribe({
      next: (admission) => {
        this.admission.set(admission);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the admission details.');
        this.router.navigate(['/ip/admissions']);
      }
    });
  }
}
