import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicBlogPostService } from '../../core/services/public-blog-post.service';
import { PublicBlogPost } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent {
  private readonly service = inject(PublicBlogPostService);
  posts = signal<PublicBlogPost[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list().subscribe((posts) => {
      this.posts.set(posts);
      this.loaded.set(true);
    });
  }
}
