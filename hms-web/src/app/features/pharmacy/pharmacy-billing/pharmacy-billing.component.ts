import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PharmacyLocation } from './pharmacy-location.model';
import { PharmacyLocationService } from './pharmacy-location.service';
import { PharmacyRequestSearchComponent } from './pharmacy-request-search.component';

/** Pharmacy Billing entry point: pick a dispensing location, then search/bill a patient. */
@Component({
  selector: 'app-pharmacy-billing',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent, PharmacyRequestSearchComponent],
  templateUrl: './pharmacy-billing.component.html',
  styleUrl: './pharmacy-billing.component.scss'
})
export class PharmacyBillingComponent {
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);

  locations = signal<PharmacyLocation[]>([]);
  selectedLocationId = signal<number | null>(null);

  constructor() {
    this.locationService.list().subscribe({
      next: (locations) => this.locations.set(locations),
      error: () => this.notification.error('Failed to load Pharmacy Locations.')
    });
  }

  selectLocation(id: number): void {
    this.selectedLocationId.set(id);
  }

  changeLocation(): void {
    this.selectedLocationId.set(null);
  }
}
