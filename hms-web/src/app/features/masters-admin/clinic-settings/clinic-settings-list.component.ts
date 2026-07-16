import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ClinicSettingsService } from './clinic-settings.service';

@Component({
  selector: 'app-clinic-settings-list',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressBarModule, PageHeaderComponent],
  templateUrl: './clinic-settings-list.component.html',
  styleUrl: './clinic-settings-list.component.scss'
})
export class ClinicSettingsListComponent {
  private readonly service = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);
  uploadingLogo = signal(false);
  logoUrl = signal<string | null>(null);

  form = {
    name: '',
    address: '',
    phone: '',
    email: '',
    tinNo: '',
    dlNo: ''
  };

  constructor() {
    this.service.get().subscribe({
      next: (settings) => {
        this.form = {
          name: settings.name,
          address: settings.address ?? '',
          phone: settings.phone ?? '',
          email: settings.email ?? '',
          tinNo: settings.tinNo ?? '',
          dlNo: settings.dlNo ?? ''
        };
        this.logoUrl.set(settings.logoUrl);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load clinic settings.');
      }
    });
  }

  get isValid(): boolean {
    return this.form.name.trim().length > 0;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }
    this.uploadingLogo.set(true);
    this.service.uploadLogo(file).subscribe({
      next: (settings) => {
        this.logoUrl.set(settings.logoUrl);
        this.uploadingLogo.set(false);
        this.notification.success('Logo updated.');
      },
      error: () => {
        this.uploadingLogo.set(false);
        this.notification.error('Failed to upload logo.');
      }
    });
  }

  save(): void {
    if (!this.isValid) {
      return;
    }
    this.saving.set(true);
    this.service
      .update({
        name: this.form.name.trim(),
        address: this.form.address.trim() || null,
        phone: this.form.phone.trim() || null,
        email: this.form.email.trim() || null,
        tinNo: this.form.tinNo.trim() || null,
        dlNo: this.form.dlNo.trim() || null
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Clinic settings saved.');
        },
        error: () => {
          this.saving.set(false);
          this.notification.error('Failed to save clinic settings.');
        }
      });
  }
}
