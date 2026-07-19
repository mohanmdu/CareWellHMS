import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'departments',
    loadComponent: () => import('./pages/departments/departments.component').then((m) => m.DepartmentsComponent)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./pages/doctors/doctor-list.component').then((m) => m.DoctorListComponent)
  },
  {
    path: 'doctors/:id',
    loadComponent: () => import('./pages/doctors/doctor-detail.component').then((m) => m.DoctorDetailComponent)
  },
  {
    path: 'book-appointment',
    loadComponent: () =>
      import('./pages/book-appointment/book-appointment.component').then((m) => m.BookAppointmentComponent)
  },
  {
    path: 'news-events',
    loadComponent: () => import('./pages/news-events/news-events.component').then((m) => m.NewsEventsComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent)
  },
  {
    path: 'videos',
    loadComponent: () => import('./pages/videos/videos.component').then((m) => m.VideosComponent)
  },
  {
    path: 'testimonials',
    loadComponent: () => import('./pages/testimonials/testimonials.component').then((m) => m.TestimonialsComponent)
  },
  {
    path: 'health-packages',
    loadComponent: () =>
      import('./pages/health-packages/health-packages.component').then((m) => m.HealthPackagesComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent)
  },
  {
    path: 'careers',
    loadComponent: () => import('./pages/careers/careers.component').then((m) => m.CareersComponent)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog-list.component').then((m) => m.BlogListComponent)
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/blog-detail.component').then((m) => m.BlogDetailComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq.component').then((m) => m.FaqComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
