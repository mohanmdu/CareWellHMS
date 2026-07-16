import { Component, computed, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PharmacyLocation } from '../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../pharmacy-billing/pharmacy-location.service';
import { BatchStockModifierComponent } from './batch-stock-modifier.component';
import { StockAdjustmentByLocationComponent } from './stock-adjustment-by-location.component';
import { StockAdjustmentFormComponent } from './stock-adjustment-form.component';

/**
 * One page, 3 inner tabs - Stock Adjustment (Main Store) / Stock Adjustment
 * by Location / Batch-wise Stock Modifier - mirroring Purchase Management's
 * "one page, several inner tabs" shape.
 */
@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [MatTabsModule, PageHeaderComponent, StockAdjustmentFormComponent, StockAdjustmentByLocationComponent, BatchStockModifierComponent],
  templateUrl: './stock-adjustment.component.html',
  styleUrl: './stock-adjustment.component.scss'
})
export class StockAdjustmentComponent {
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);

  locations = signal<PharmacyLocation[]>([]);
  mainStoreLocationId = computed(() => this.locations().find((l) => l.name === 'Main Store')?.id ?? null);

  constructor() {
    this.locationService.list().subscribe({
      next: (locations) => this.locations.set(locations),
      error: () => this.notification.error('Failed to load Pharmacy Locations.')
    });
  }
}
