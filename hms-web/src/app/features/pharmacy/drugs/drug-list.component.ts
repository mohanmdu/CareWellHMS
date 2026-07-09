import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { Drug } from './drug.model';
import { DrugService } from './drug.service';

/**
 * Drugs carry more fields than the generic { name, active } master shape
 * (generic name, manufacturer, unit of measure), so this is hand-built
 * rather than driven by shared/master-crud - same pattern as Consultants.
 */
@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './drug-list.component.html',
  styleUrl: './drug-list.component.scss'
})
export class DrugListComponent {
  private readonly service = inject(DrugService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly displayedColumns = ['name', 'genericName', 'manufacturer', 'unit', 'status', 'actions'];

  drugs = signal<Drug[]>([]);
  loading = signal(false);
  saving = signal(false);
  form = { name: '', genericName: '', manufacturer: '', unitOfMeasure: '' };

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (drugs) => {
        this.drugs.set(drugs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load drugs.');
      }
    });
  }

  add(): void {
    if (!this.form.name.trim()) {
      return;
    }
    this.saving.set(true);
    this.service.create({ ...this.form }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form = { name: '', genericName: '', manufacturer: '', unitOfMeasure: '' };
        this.notification.success('Drug added.');
        this.refresh();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to create drug.');
      }
    });
  }

  deactivate(drug: Drug): void {
    if (drug.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${drug.name}?`,
        message: 'This drug will no longer be selectable when receiving new stock.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || drug.id === null) {
          return;
        }
        this.service.deactivate(drug.id).subscribe({
          next: () => {
            this.notification.success('Drug deactivated.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to deactivate drug.')
        });
      });
  }
}
