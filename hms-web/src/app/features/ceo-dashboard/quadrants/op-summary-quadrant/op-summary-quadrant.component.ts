import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, of, switchMap } from 'rxjs';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { chartBorderColor, chartMutedColor, chartSeriesColors } from '../../chart-colors';
import { CeoDashboardService } from '../../ceo-dashboard.service';
import { CeoOpSummary } from '../../ceo-dashboard.model';

/** OP Dashboard quadrant - "New" = the patient's chronologically first-ever appointment, see CeoOpSummaryService. */
@Component({
  selector: 'app-op-summary-quadrant',
  standalone: true,
  imports: [BaseChartDirective, MatButtonModule, MatProgressBarModule, RouterLink, EmptyStateComponent],
  templateUrl: './op-summary-quadrant.component.html',
  styleUrl: '../ceo-dashboard-quadrant.scss'
})
export class OpSummaryQuadrantComponent {
  private readonly service = inject(CeoDashboardService);

  fromDate = input<string | null>(null);
  toDate = input<string | null>(null);

  loading = signal(true);
  error = signal(false);
  data = signal<CeoOpSummary | null>(null);

  readonly isEmpty = computed(() => {
    const d = this.data();
    return !d || d.totalAppointments === 0;
  });

  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const d = this.data();
    const colors = chartSeriesColors();
    return {
      labels: ['Total Appointments', 'New', 'Repeat'],
      datasets: [
        {
          data: [d?.totalAppointments ?? 0, d?.newAppointments ?? 0, d?.repeatAppointments ?? 0],
          backgroundColor: [colors[3], colors[1], colors[0]],
          borderRadius: 6,
          maxBarThickness: 48
        }
      ]
    };
  });

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { color: chartMutedColor() }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: chartMutedColor(), precision: 0 }, grid: { color: chartBorderColor() } }
    }
  };

  constructor() {
    toObservable(computed(() => ({ from: this.fromDate(), to: this.toDate() })))
      .pipe(
        switchMap(({ from, to }) => {
          this.loading.set(true);
          this.error.set(false);
          return this.service.opSummary(from, to).pipe(catchError(() => of(null)));
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
    this.service.opSummary(this.fromDate(), this.toDate()).subscribe({
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
