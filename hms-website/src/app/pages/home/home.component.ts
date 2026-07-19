import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicBannerSlideService } from '../../core/services/public-banner-slide.service';
import { PublicSiteContentService } from '../../core/services/public-site-content.service';
import { PublicNewsEventService } from '../../core/services/public-news-event.service';
import { PublicTestimonialService } from '../../core/services/public-testimonial.service';
import {
  PublicBannerSlide,
  PublicNewsEvent,
  PublicSiteContent,
  PublicTestimonial
} from '../../core/models/public.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {
  private readonly bannerService = inject(PublicBannerSlideService);
  private readonly siteContentService = inject(PublicSiteContentService);
  private readonly newsService = inject(PublicNewsEventService);
  private readonly testimonialService = inject(PublicTestimonialService);
  private readonly platformId = inject(PLATFORM_ID);
  private rotationTimer?: ReturnType<typeof setInterval>;

  slides = signal<PublicBannerSlide[]>([]);
  activeSlide = signal(0);
  siteContent = signal<PublicSiteContent | null>(null);
  news = signal<PublicNewsEvent[]>([]);
  testimonials = signal<PublicTestimonial[]>([]);

  constructor() {
    this.bannerService.list().subscribe((slides) => {
      this.slides.set(slides);
      if (isPlatformBrowser(this.platformId) && slides.length > 1) {
        this.rotationTimer = setInterval(() => this.next(), 6000);
      }
    });
    this.siteContentService.get().subscribe((content) => this.siteContent.set(content));
    this.newsService.list().subscribe((news) => this.news.set(news.slice(0, 3)));
    this.testimonialService.list().subscribe((testimonials) => this.testimonials.set(testimonials.slice(0, 3)));
  }

  next(): void {
    const total = this.slides().length;
    if (total > 0) {
      this.activeSlide.set((this.activeSlide() + 1) % total);
    }
  }

  previous(): void {
    const total = this.slides().length;
    if (total > 0) {
      this.activeSlide.set((this.activeSlide() - 1 + total) % total);
    }
  }

  goTo(index: number): void {
    this.activeSlide.set(index);
  }

  ngOnDestroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }
}
