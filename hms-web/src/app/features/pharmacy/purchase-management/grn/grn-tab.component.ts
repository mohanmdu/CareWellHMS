import { Component, signal, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DraftGrnListComponent } from './draft-grn-list.component';
import { GrnFormComponent } from './grn-form.component';
import { GrnListComponent } from './grn-list.component';

/**
 * Inner tab-group for outer Tab 2 "Goods Receipt (GRN)": Direct GRN / Draft
 * GRN / GRN Report - both Direct GRN and Draft GRN "handle in single
 * screen" per the legacy spec (editing a draft reopens the same Direct GRN
 * form, pre-loaded, rather than a second bespoke edit screen).
 */
@Component({
  selector: 'app-grn-tab',
  standalone: true,
  imports: [MatTabsModule, GrnFormComponent, DraftGrnListComponent, GrnListComponent],
  templateUrl: './grn-tab.component.html',
  styleUrl: './grn-tab.component.scss'
})
export class GrnTabComponent {
  @ViewChild(DraftGrnListComponent) draftList?: DraftGrnListComponent;
  @ViewChild(GrnListComponent) reportList?: GrnListComponent;

  tabIndex = signal(0);
  editingGrnId = signal<number | null>(null);

  onTabChange(index: number): void {
    this.tabIndex.set(index);
    if (index === 1) {
      this.draftList?.refresh();
    } else if (index === 2) {
      this.reportList?.refresh();
    }
  }

  editDraft(id: number): void {
    this.editingGrnId.set(id);
    this.tabIndex.set(0);
  }

  onSaved(): void {
    this.editingGrnId.set(null);
    this.draftList?.refresh();
    this.reportList?.refresh();
  }
}
