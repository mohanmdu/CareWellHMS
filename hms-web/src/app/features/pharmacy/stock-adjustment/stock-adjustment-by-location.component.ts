import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyLocation } from '../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../pharmacy-billing/pharmacy-location.service';
import { StockAdjustmentFormComponent } from './stock-adjustment-form.component';

/**
 * "DEPARTMENT LIST" tab content: IP/OP tiles that reuse the exact same
 * StockAdjustmentFormComponent as the plain Stock Adjustment tab, just with
 * a locked-in locationId - satisfying the spec's own "must repeat the same
 * business logic" instruction literally via one shared component. Embedded
 * as a tab inside stock-adjustment.component.ts (no page-header of its
 * own), mirroring how Purchase Management nests its inner tab components.
 */
@Component({
  selector: 'app-stock-adjustment-by-location',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, EmptyStateComponent, StockAdjustmentFormComponent],
  templateUrl: './stock-adjustment-by-location.component.html',
  styleUrl: './stock-adjustment-by-location.component.scss'
})
export class StockAdjustmentByLocationComponent {
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);

  locations = signal<PharmacyLocation[]>([]);
  departmentTiles = computed(() => this.locations().filter((l) => l.name === 'IP' || l.name === 'OP'));
  selectedLocation = signal<PharmacyLocation | null>(null);

  constructor() {
    this.locationService.list().subscribe({
      next: (locations) => this.locations.set(locations),
      error: () => this.notification.error('Failed to load Pharmacy Locations.')
    });
  }

  selectDepartment(location: PharmacyLocation): void {
    this.selectedLocation.set(location);
  }

  changeDepartment(): void {
    this.selectedLocation.set(null);
  }
}
