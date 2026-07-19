import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { CmsHealthPackage, CmsHealthPackageInput } from './cms-health-package.model';
import { CmsHealthPackageService } from './cms-health-package.service';

const EMPTY_FORM: CmsHealthPackageInput = { name: '', description: '', price: 0, includes: '' };

/**
 * Website Health Packages: inline Name/Description/Price/Includes
 * Add/Update/Clear form plus Active/Deactivated tables.
 */
@Component({
  selector: 'app-cms-health-package-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './cms-health-package-list.component.html',
  styleUrl: './cms-health-package-list.component.scss'
})
export class CmsHealthPackageListComponent {
  private readonly service = inject(CmsHealthPackageService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['name', 'price', 'description', 'actions'];
  readonly inactiveColumns = ['name', 'price', 'description', 'actions'];

  activePackages = signal<CmsHealthPackage[]>([]);
  inactivePackages = signal<CmsHealthPackage[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  editingId = signal<number | null>(null);
  form: CmsHealthPackageInput = { ...EMPTY_FORM };

  constructor() {
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (packages) => {
        this.activePackages.set(packages);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load health packages.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (packages) => {
        this.inactivePackages.set(packages);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated health packages.');
      }
    });
  }

  edit(pkg: CmsHealthPackage): void {
    if (pkg.id === null) {
      return;
    }
    this.editingId.set(pkg.id);
    this.form = { name: pkg.name, description: pkg.description, price: pkg.price, includes: pkg.includes };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.name.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Health package updated.' : 'Health package added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save health package.');
      }
    });
  }

  deactivate(pkg: CmsHealthPackage): void {
    if (pkg.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${pkg.name}?`,
        message: 'It will no longer be shown on the public website. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || pkg.id === null) {
          return;
        }
        this.service.deactivate(pkg.id).subscribe({
          next: () => {
            this.notification.success('Health package deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate health package.')
        });
      });
  }

  restore(pkg: CmsHealthPackage): void {
    if (pkg.id === null) {
      return;
    }
    this.service.restore(pkg.id).subscribe({
      next: () => {
        this.notification.success('Health package restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore health package.')
    });
  }
}
