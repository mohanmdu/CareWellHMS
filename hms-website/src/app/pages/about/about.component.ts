import { Component, inject, signal } from '@angular/core';
import { PublicSiteContentService } from '../../core/services/public-site-content.service';
import { PublicSiteContent } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private readonly service = inject(PublicSiteContentService);
  content = signal<PublicSiteContent | null>(null);

  constructor() {
    this.service.get().subscribe((content) => this.content.set(content));
  }
}
