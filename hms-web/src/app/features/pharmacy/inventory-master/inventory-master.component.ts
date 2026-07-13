import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ManufacturerListComponent } from './manufacturers/manufacturer-list.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductTypeListComponent } from './product-types/product-type-list.component';
import { RackListComponent } from './racks/rack-list.component';
import { SupplierListComponent } from './suppliers/supplier-list.component';

/**
 * Pharmacy > Inventory Master: one screen, five tabs (Supplier, Manufacturer,
 * Product, Product Type, Rack masters), same "one workspace, multiple tabs"
 * shape as Patient Prescription / Refund & Report elsewhere in this app.
 */
@Component({
  selector: 'app-inventory-master',
  standalone: true,
  imports: [
    MatTabsModule,
    PageHeaderComponent,
    SupplierListComponent,
    ManufacturerListComponent,
    ProductListComponent,
    ProductTypeListComponent,
    RackListComponent
  ],
  templateUrl: './inventory-master.component.html',
  styleUrl: './inventory-master.component.scss'
})
export class InventoryMasterComponent {}
