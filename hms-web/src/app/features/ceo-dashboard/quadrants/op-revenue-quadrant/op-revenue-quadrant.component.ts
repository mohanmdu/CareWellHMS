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
import { CeoOpRevenue } from '../../ceo-dashboard.model';

interface LegendRow {
  label: string;
  value: number;
  percent: number;
  color: string;
}

/**
 * OP Revenue donut chart. Unlike the IP side, Lab and Radiology are split
 * here - folds together real Lab Requisition items and ad-hoc OP Direct
 * Billing items, see CeoOpRevenueService.
 */
@Component({
  selector: 'app-op-revenue-quadrant',
  standalone: true,
  imports: [BaseChartDirective, DecimalPipe, MatButtonModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './op-revenue-quadrant.component.html',
  styleUrl: '../ceo-dashboard-quadrant.scss'
})
export class OpRevenueQuadrantComponent {
  private readonly service = inject(CeoDashboardService);

  fromDate = input<string | null>(null);
  toDate = input<string | null>(null);

  loading = signal(true);
  error = signal(false);
  data = signal<CeoOpRevenue | null>(null);

  readonly isEmpty = computed(() => {
    const d = this.data();
    return !d || d.total === 0;
  });

  private readonly labels = ['Consulting Fee', 'Lab', 'Radiology', 'Pharmacy', 'Other'];

  readonly legendRows = computed<LegendRow[]>(() => {
    const d = this.data();
    const colors = chartSeriesColors();
    const values = [d?.consultingFee ?? 0, d?.lab ?? 0, d?.radiology ?? 0, d?.pharmacy ?? 0, d?.other ?? 0];
    const total = d?.total ?? 0;
    return this.labels.map((label, i) => ({
      label,
      value: values[i],
      percent: total > 0 ? Math.round((values[i] / total) * 100) : 0,
      color: colors[i]
    }));
  });

  readonly chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
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

  readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
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
          return this.service.opRevenue(from, to).pipe(catchError(() => of(null)));
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
    this.service.opRevenue(this.fromDate(), this.toDate()).subscribe({
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
