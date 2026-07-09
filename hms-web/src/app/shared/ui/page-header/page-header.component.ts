import { Component, input } from '@angular/core';

/**
 * Consistent title/subtitle/actions banner used at the top of every feature
 * screen. Primary action buttons are projected in; keeps every list/wizard
 * page's header markup and spacing identical instead of each screen
 * hand-rolling its own <h2>.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | null>(null);
}
