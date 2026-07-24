import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { IpSummaryQuadrantComponent } from './quadrants/ip-summary-quadrant/ip-summary-quadrant.component';
import { OpSummaryQuadrantComponent } from './quadrants/op-summary-quadrant/op-summary-quadrant.component';
import { IpRevenueQuadrantComponent } from './quadrants/ip-revenue-quadrant/ip-revenue-quadrant.component';
import { OpRevenueQuadrantComponent } from './quadrants/op-revenue-quadrant/op-revenue-quadrant.component';

function toIsoDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Executive dashboard: one global From/To filter feeding 4 independent
 * quadrants (IP Dashboard, OP Dashboard, IP Revenue, OP Revenue), each
 * fetching from its own endpoint so a slow/broken quadrant never blocks the
 * others - see CeoDashboardService/CeoDashboardController. appliedFrom/
 * appliedTo only change when Find is clicked (not on every keystroke in the
 * datepickers), and are passed down as inputs so each quadrant re-fetches
 * independently via its own toObservable(...)+switchMap.
 *
 * Defaults to today's date on load (not all-time) - matches
 * CollectionReportComponent's same "signal<Date|null>(new Date())" default -
 * the From/To pickers are for deliberately widening to a specific range, not
 * the landing view.
 */
@Component({
  selector: 'app-ceo-dashboard',
  standalone: true,
  // Registered here (not app.config.ts) so chart.js/ng2-charts only load as
  // part of this lazy route's chunk, not in every user's eager initial bundle.
  providers: [provideCharts(withDefaultRegisterables())],
  imports: [
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    IpSummaryQuadrantComponent,
    OpSummaryQuadrantComponent,
    IpRevenueQuadrantComponent,
    OpRevenueQuadrantComponent
  ],
  templateUrl: './ceo-dashboard.component.html',
  styleUrl: './ceo-dashboard.component.scss'
})
export class CeoDashboardComponent {
  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());

  appliedFrom = signal<string | null>(toIsoDate(this.fromDate()));
  appliedTo = signal<string | null>(toIsoDate(this.toDate()));

  find(): void {
    this.appliedFrom.set(toIsoDate(this.fromDate()));
    this.appliedTo.set(toIsoDate(this.toDate()));
  }
}
