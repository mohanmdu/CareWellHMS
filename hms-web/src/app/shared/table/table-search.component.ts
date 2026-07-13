import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

/**
 * Consistent search box for the table grids across the app - paired with
 * TablePagination, which resets to page 0 whenever the search term changes.
 */
@Component({
  selector: 'app-table-search',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="table-search-field" subscriptSizing="dynamic">
      <mat-icon matPrefix aria-hidden="true">search</mat-icon>
      <input matInput [placeholder]="placeholder()" [ngModel]="value()" (ngModelChange)="valueChange.emit($event)" />
    </mat-form-field>
  `,
  styles: [
    `
      .table-search-field {
        width: 100%;
        max-width: 320px;
      }
    `
  ]
})
export class TableSearchComponent {
  placeholder = input('Search...');
  value = input('');
  valueChange = output<string>();
}
