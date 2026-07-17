import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { Admission } from './admission.model';
import { AdmissionService } from './admission.service';

/** IPID success banner (PDF p.4-6): "The Patient {name} has been registered with the IPID {IPID} successfully." */
@Component({
  selector: 'app-admission-registration-success',
  standalone: true,
  imports: [MatButtonModule, MatProgressBarModule, RouterLink],
  templateUrl: './admission-registration-success.component.html',
  styleUrl: './admission-registration-success.component.scss'
})
export class AdmissionRegistrationSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admissionService = inject(AdmissionService);
  private readonly notification = inject(NotificationService);

  admission = signal<Admission | null>(null);
  loading = signal(true);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('admissionId'));
    this.admissionService.get(id).subscribe({
      next: (admission) => {
        this.admission.set(admission);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the registration details.');
        this.router.navigate(['/ip/admissions/new']);
      }
    });
  }
}
