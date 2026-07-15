import { Component, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PoApprovedListComponent } from './po-approved-list.component';
import { PoPendingListComponent } from './po-pending-list.component';
import { RaisePoComponent } from './raise-po.component';

/** Inner tab-group for outer Tab 1 "Raise & Approve PO": Raise PO / Pending Approval / Approved POs. */
@Component({
  selector: 'app-raise-approve-po-tab',
  standalone: true,
  imports: [MatTabsModule, RaisePoComponent, PoPendingListComponent, PoApprovedListComponent],
  templateUrl: './raise-approve-po-tab.component.html',
  styleUrl: './raise-approve-po-tab.component.scss'
})
export class RaiseApprovePoTabComponent {
  @ViewChild(PoPendingListComponent) pendingList?: PoPendingListComponent;
  @ViewChild(PoApprovedListComponent) approvedList?: PoApprovedListComponent;

  onTabChange(index: number): void {
    if (index === 1) {
      this.pendingList?.refresh();
    } else if (index === 2) {
      this.approvedList?.refresh();
    }
  }
}
