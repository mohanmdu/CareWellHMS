import { Component, inject, signal } from '@angular/core';
import { PublicTestimonialService } from '../../core/services/public-testimonial.service';
import { PublicTestimonial } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  private readonly service = inject(PublicTestimonialService);
  testimonials = signal<PublicTestimonial[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list().subscribe((testimonials) => {
      this.testimonials.set(testimonials);
      this.loaded.set(true);
    });
  }

  stars(rating: number | null): number[] {
    return Array.from({ length: rating ?? 0 });
  }
}
