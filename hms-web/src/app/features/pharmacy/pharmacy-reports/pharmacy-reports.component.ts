import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DetailedSalesReportComponent } from './detailed-sales-report.component';
import { DiReportComponent } from './di-report.component';
import { GenerateStatementComponent } from './generate-statement.component';
import { GstStatementComponent } from './gst-statement.component';
import { SalesReportDuesComponent } from './sales-report-dues.component';
import { SalesGstReportComponent } from './sales-gst-report.component';
import { SalesReportComponent } from './sales-report.component';
import { PurchaseGstReportComponent } from './purchase-gst-report.component';
import { PurchaseReturnReportComponent } from './purchase-return-report.component';
import { SalesReturnReportComponent } from './sales-return-report.component';
import { StockAdjustmentReportComponent } from './stock-adjustment-report.component';
import { StockBalanceReportComponent } from './stock-balance-report.component';
import { VatStatementComponent } from './vat-statement.component';

/**
 * Sales Report / Dues / Detailed Sales Report / Sales Return Report / Stock
 * Adjustment Report / Stock Balance Report / Purchase Return Report /
 * Generate Statement / Vat Statement / GST Statement / Sales GST Report /
 * Purchase GST Report / DI Report as sibling tabs - a flatter shape than
 * nesting, chosen to avoid deep tab nesting in the UI (same posture as the
 * original Sales Return Report addition).
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
    SalesReturnReportComponent,
    StockAdjustmentReportComponent,
    StockBalanceReportComponent,
    PurchaseReturnReportComponent,
    GenerateStatementComponent,
    VatStatementComponent,
    GstStatementComponent,
    SalesGstReportComponent,
    PurchaseGstReportComponent,
    DiReportComponent
  ],
  templateUrl: './pharmacy-reports.component.html',
  styleUrl: './pharmacy-reports.component.scss'
})
export class PharmacyReportsComponent {}
