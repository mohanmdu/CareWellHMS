import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicBlogPostService } from '../../core/services/public-blog-post.service';
import { PublicBlogPost } from '../../core/models/public.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent {
  private readonly service = inject(PublicBlogPostService);
  private readonly route = inject(ActivatedRoute);

  post = signal<PublicBlogPost | null>(null);
  notFound = signal(false);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.service.getBySlug(slug).subscribe({
      next: (post) => this.post.set(post),
      error: () => this.notFound.set(true)
    });
  }
}
