import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, of, switchMap } from 'rxjs';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { chartBorderColor, chartMutedColor, chartSeriesColors, chartTextColor } from '../../chart-colors';
import { CeoDashboardService } from '../../ceo-dashboard.service';
import { CeoIpSummary } from '../../ceo-dashboard.model';

/** IP Dashboard quadrant - bed occupancy is a live snapshot, Admitted/Discharged are date-ranged. */
@Component({
  selector: 'app-ip-summary-quadrant',
  standalone: true,
  imports: [BaseChartDirective, MatButtonModule, MatProgressBarModule, RouterLink, EmptyStateComponent],
  templateUrl: './ip-summary-quadrant.component.html',
  styleUrl: '../ceo-dashboard-quadrant.scss'
})
export class IpSummaryQuadrantComponent {
  private readonly service = inject(CeoDashboardService);

  fromDate = input<string | null>(null);
  toDate = input<string | null>(null);

  loading = signal(true);
  error = signal(false);
  data = signal<CeoIpSummary | null>(null);

  readonly isEmpty = computed(() => {
    const d = this.data();
    return !d || (d.bedsTotal === 0 && d.patientsAdmitted === 0 && d.patientsDischarged === 0);
  });

  readonly occupancyPercent = computed(() => {
    const d = this.data();
    if (!d || d.bedsTotal === 0) {
      return 0;
    }
    return Math.round((d.bedsOccupied / d.bedsTotal) * 100);
  });

  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const d = this.data();
    const colors = chartSeriesColors();
    return {
      labels: ['Bed Occupancy', 'Patients Admitted', 'Patients Discharged'],
      datasets: [
        {
          data: [d?.bedsOccupied ?? 0, d?.patientsAdmitted ?? 0, d?.patientsDischarged ?? 0],
          backgroundColor: [colors[0], colors[1], colors[2]],
          borderRadius: 6,
          maxBarThickness: 48
        }
      ]
    };
  });

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
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
          return this.service.ipSummary(from, to).pipe(catchError(() => of(null)));
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
    this.service.ipSummary(this.fromDate(), this.toDate()).subscribe({
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
