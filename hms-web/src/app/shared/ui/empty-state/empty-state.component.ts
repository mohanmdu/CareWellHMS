import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Standard "nothing here yet" panel for empty tables/lists, replacing ad hoc
 * blank tables or missing-state silence across the app.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  icon = input('inbox');
  title = input.required<string>();
  message = input<string | null>(null);
}
