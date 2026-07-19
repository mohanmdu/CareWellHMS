import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicConsultantService } from '../../core/services/public-consultant.service';
import { PublicConsultant } from '../../core/models/public.model';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './doctor-detail.component.html',
  styleUrl: './doctor-detail.component.scss'
})
export class DoctorDetailComponent {
  private readonly service = inject(PublicConsultantService);
  private readonly route = inject(ActivatedRoute);

  doctor = signal<PublicConsultant | null>(null);
  notFound = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.get(id).subscribe({
      next: (doctor) => this.doctor.set(doctor),
      error: () => this.notFound.set(true)
    });
  }
}
