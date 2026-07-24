import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, of, switchMap } from 'rxjs';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { chartBorderColor, chartSeriesColors } from '../../chart-colors';
import { CeoDashboardService } from '../../ceo-dashboard.service';
import { CeoIpRevenue } from '../../ceo-dashboard.model';

interface LegendRow {
  label: string;
  value: number;
  percent: number;
  color: string;
}

/**
 * IP Revenue pie chart. Room Rent, Lab & X-ray and Pharmacy each come from
 * their own authoritative source; Consulting Fee vs "IP Billing" splits by
 * the admin-configurable revenue_bucket tag on IP Billing Categories - see
 * CeoIpRevenueService.
 */
@Component({
  selector: 'app-ip-revenue-quadrant',
  standalone: true,
  imports: [BaseChartDirective, DecimalPipe, MatButtonModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './ip-revenue-quadrant.component.html',
  styleUrl: '../ceo-dashboard-quadrant.scss'
})
export class IpRevenueQuadrantComponent {
  private readonly service = inject(CeoDashboardService);

  fromDate = input<string | null>(null);
  toDate = input<string | null>(null);

  loading = signal(true);
  error = signal(false);
  data = signal<CeoIpRevenue | null>(null);

  readonly isEmpty = computed(() => {
    const d = this.data();
    return !d || d.total === 0;
  });

  private readonly labels = ['Lab & X-ray', 'Pharmacy', 'Room Rent', 'Consulting Fee', 'IP Billing'];

  readonly legendRows = computed<LegendRow[]>(() => {
    const d = this.data();
    const colors = chartSeriesColors();
    const values = [d?.labXray ?? 0, d?.pharmacy ?? 0, d?.roomRent ?? 0, d?.consultingFee ?? 0, d?.other ?? 0];
    const total = d?.total ?? 0;
    return this.labels.map((label, i) => ({
      label,
      value: values[i],
      percent: total > 0 ? Math.round((values[i] / total) * 100) : 0,
      color: colors[i]
    }));
  });

  readonly chartData = computed<ChartConfiguration<'pie'>['data']>(() => {
    const rows = this.legendRows();
    return {
      labels: this.labels,
      datasets: [
        {
          data: rows.map((r) => r.value),
          backgroundColor: rows.map((r) => r.color),
          borderColor: chartBorderColor(),
          borderWidth: 2
        }
      ]
    };
  });

  readonly chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  constructor() {
    toObservable(computed(() => ({ from: this.fromDate(), to: this.toDate() })))
      .pipe(
        switchMap(({ from, to }) => {
          this.loading.set(true);
          this.error.set(false);
          return this.service.ipRevenue(from, to).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((result) => {
        this.loading.set(false);
        if (result === null) {
          this.error.set(true);
          return;
        }
        this.data.set(result);
      });
  }

  retry(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.ipRevenue(this.fromDate(), this.toDate()).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.data.set(result);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }
}
