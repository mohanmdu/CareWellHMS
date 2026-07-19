import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PublicHealthPackageService } from '../../core/services/public-health-package.service';
import { PublicHealthPackage } from '../../core/models/public.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-health-packages',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent],
  templateUrl: './health-packages.component.html',
  styleUrl: './health-packages.component.scss'
})
export class HealthPackagesComponent {
  private readonly service = inject(PublicHealthPackageService);
  packages = signal<PublicHealthPackage[]>([]);
  loaded = signal(false);

  constructor() {
    this.service.list().subscribe((packages) => {
      this.packages.set(packages);
      this.loaded.set(true);
    });
  }
}
