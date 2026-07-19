import { Component, inject, signal } from '@angular/core';
import { PublicCareerOpeningService } from '../../core/services/public-career-opening.service';
import { PublicCareerOpening } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.scss'
})
export class CareersComponent {
  private readonly service = inject(PublicCareerOpeningService);
  openings = signal<PublicCareerOpening[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list().subscribe((openings) => {
      this.openings.set(openings);
      this.loaded.set(true);
    });
  }
}
