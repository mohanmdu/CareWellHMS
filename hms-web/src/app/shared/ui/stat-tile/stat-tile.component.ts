import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StatTileTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * KPI tile used on the MIS dashboard (and any future summary screen) so
 * every metric card shares the same icon/value/label layout and color
 * language instead of the bespoke .tile CSS the dashboard used to own.
 */
@Component({
  selector: 'app-stat-tile',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './stat-tile.component.html',
  styleUrl: './stat-tile.component.scss'
})
export class StatTileComponent {
  icon = input.required<string>();
  value = input.required<string | number>();
  label = input.required<string>();
  tone = input<StatTileTone>('primary');
}
