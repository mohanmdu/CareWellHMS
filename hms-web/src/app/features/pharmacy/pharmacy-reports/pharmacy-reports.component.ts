import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DetailedSalesReportComponent } from './detailed-sales-report.component';
import { SalesReportDuesComponent } from './sales-report-dues.component';
import { SalesReportComponent } from './sales-report.component';
import { SalesReturnReportComponent } from './sales-return-report.component';

/**
 * Sales Report / Dues / Detailed Sales Report / Sales Return Report as 4
 * sibling tabs - a flatter shape than the original plan's "Detailed Sales
 * Report nested inside Dues", chosen to avoid deep tab nesting in the UI.
 */
@Component({
  selector: 'app-pharmacy-reports',
  standalone: true,
  imports: [
    MatTabsModule,
    PageHeaderComponent,
    SalesReportComponent,
    SalesReportDuesComponent,
    DetailedSalesReportComponent,
    SalesReturnReportComponent
  ],
  templateUrl: './pharmacy-reports.component.html',
  styleUrl: './pharmacy-reports.component.scss'
})
export class PharmacyReportsComponent {}
