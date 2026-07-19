import { Component, inject, signal } from '@angular/core';
import { PublicGalleryItemService } from '../../core/services/public-gallery-item.service';
import { PublicGalleryItem } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss'
})
export class VideosComponent {
  private readonly service = inject(PublicGalleryItemService);
  items = signal<PublicGalleryItem[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list('VIDEO').subscribe((items) => {
      this.items.set(items);
      this.loaded.set(true);
    });
  }
}
