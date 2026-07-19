import { Component, inject, signal } from '@angular/core';
import { PublicFaqService } from '../../core/services/public-faq.service';
import { PublicFaq } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  private readonly service = inject(PublicFaqService);
  faqs = signal<PublicFaq[]>([]);
  loaded = signal(false);
  openId = signal<number | null>(null);

  constructor() {
    this.service.list().subscribe((faqs) => {
      this.faqs.set(faqs);
      this.loaded.set(true);
    });
  }

  toggle(id: number): void {
    this.openId.set(this.openId() === id ? null : id);
  }
}
