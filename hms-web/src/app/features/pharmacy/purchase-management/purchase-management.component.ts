import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { GrnTabComponent } from './grn/grn-tab.component';
import { RaiseApprovePoTabComponent } from './purchase-orders/raise-approve-po-tab.component';

/**
 * Pharmacy > Purchase Management: one screen, two outer tabs (Raise &
 * Approve PO / GRN), each with its own inner tab-group - same "one
 * workspace, nested tabs" shape as Inventory Master's Supplier/Manufacturer
 * screens.
 */
@Component({
  selector: 'app-purchase-management',
  standalone: true,
  imports: [MatTabsModule, PageHeaderComponent, RaiseApprovePoTabComponent, GrnTabComponent],
  templateUrl: './purchase-management.component.html',
  styleUrl: './purchase-management.component.scss'
})
export class PurchaseManagementComponent {}
