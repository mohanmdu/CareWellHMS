import { Component, inject, signal } from '@angular/core';
import { PublicGalleryItemService } from '../../core/services/public-gallery-item.service';
import { PublicGalleryItem } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  private readonly service = inject(PublicGalleryItemService);
  items = signal<PublicGalleryItem[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list('PHOTO').subscribe((items) => {
      this.items.set(items);
      this.loaded.set(true);
    });
  }
}
