import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PublicNewsEventService } from '../../core/services/public-news-event.service';
import { PublicNewsEvent } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-news-events',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './news-events.component.html',
  styleUrl: './news-events.component.scss'
})
export class NewsEventsComponent {
  private readonly service = inject(PublicNewsEventService);
  items = signal<PublicNewsEvent[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list().subscribe((items) => {
      this.items.set(items);
      this.loaded.set(true);
    });
  }
}
