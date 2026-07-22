import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NotificationService } from '../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ThemeService } from '../../../core/services/theme.service';
import {
  CORNER_RADIUS_STYLE_OPTIONS,
  CornerRadiusStyle,
  FONT_FAMILY_OPTIONS,
  THEME_MODE_OPTIONS,
  ThemeMode
} from './clinic-settings.model';
import { ClinicSettingsService } from './clinic-settings.service';

@Component({
  selector: 'app-clinic-settings-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    PageHeaderComponent
  ],
  templateUrl: './clinic-settings-list.component.html',
  styleUrl: './clinic-settings-list.component.scss'
})
export class ClinicSettingsListComponent {
  private readonly service = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);
  private readonly themeService = inject(ThemeService);

  readonly themeModeOptions = THEME_MODE_OPTIONS;
  readonly cornerRadiusStyleOptions = CORNER_RADIUS_STYLE_OPTIONS;
  readonly fontFamilyOptions = FONT_FAMILY_OPTIONS;

  loading = signal(true);
  saving = signal(false);
  uploadingLogo = signal(false);
  uploadingFavicon = signal(false);
  logoUrl = signal<string | null>(null);
  faviconUrl = signal<string | null>(null);

  form = {
    name: '',
    address: '',
    phone: '',
    email: '',
    tinNo: '',
    dlNo: '',
    websiteEnabled: false,
    domain: '',
    themePrimaryColor: '',
    themeSecondaryColor: '',
    seoDefaultTitle: '',
    seoDefaultDescription: '',
    socialFacebookUrl: '',
    socialInstagramUrl: '',
    socialYoutubeUrl: '',
    whatsappNumber: '',
    themeMode: 'LIGHT' as ThemeMode,
    themeTertiaryColor: '',
    fontFamily: '',
    cornerRadiusStyle: 'ROUNDED' as CornerRadiusStyle,
    headerBackgroundColor: '',
    footerBackgroundColor: '',
    footerText: ''
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
          dlNo: settings.dlNo ?? '',
          websiteEnabled: settings.websiteEnabled,
          domain: settings.domain ?? '',
          themePrimaryColor: settings.themePrimaryColor ?? '',
          themeSecondaryColor: settings.themeSecondaryColor ?? '',
          seoDefaultTitle: settings.seoDefaultTitle ?? '',
          seoDefaultDescription: settings.seoDefaultDescription ?? '',
          socialFacebookUrl: settings.socialFacebookUrl ?? '',
          socialInstagramUrl: settings.socialInstagramUrl ?? '',
          socialYoutubeUrl: settings.socialYoutubeUrl ?? '',
          whatsappNumber: settings.whatsappNumber ?? '',
          themeMode: settings.themeMode,
          themeTertiaryColor: settings.themeTertiaryColor ?? '',
          fontFamily: settings.fontFamily ?? '',
          cornerRadiusStyle: settings.cornerRadiusStyle,
          headerBackgroundColor: settings.headerBackgroundColor ?? '',
          footerBackgroundColor: settings.footerBackgroundColor ?? '',
          footerText: settings.footerText ?? ''
        };
        this.logoUrl.set(settings.logoUrl);
        this.faviconUrl.set(settings.faviconUrl);
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

  onFaviconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }
    this.uploadingFavicon.set(true);
    this.service.uploadFavicon(file).subscribe({
      next: (settings) => {
        this.faviconUrl.set(settings.faviconUrl);
        this.uploadingFavicon.set(false);
        this.notification.success('Favicon updated.');
      },
      error: () => {
        this.uploadingFavicon.set(false);
        this.notification.error('Failed to upload favicon.');
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
        dlNo: this.form.dlNo.trim() || null,
        websiteEnabled: this.form.websiteEnabled,
        domain: this.form.domain.trim() || null,
        themePrimaryColor: this.form.themePrimaryColor.trim() || null,
        themeSecondaryColor: this.form.themeSecondaryColor.trim() || null,
        seoDefaultTitle: this.form.seoDefaultTitle.trim() || null,
        seoDefaultDescription: this.form.seoDefaultDescription.trim() || null,
        socialFacebookUrl: this.form.socialFacebookUrl.trim() || null,
        socialInstagramUrl: this.form.socialInstagramUrl.trim() || null,
        socialYoutubeUrl: this.form.socialYoutubeUrl.trim() || null,
        whatsappNumber: this.form.whatsappNumber.trim() || null,
        themeMode: this.form.themeMode,
        themeTertiaryColor: this.form.themeTertiaryColor.trim() || null,
        fontFamily: this.form.fontFamily.trim() || null,
        cornerRadiusStyle: this.form.cornerRadiusStyle,
        headerBackgroundColor: this.form.headerBackgroundColor.trim() || null,
        footerBackgroundColor: this.form.footerBackgroundColor.trim() || null,
        footerText: this.form.footerText.trim() || null
      })
      .subscribe({
        next: (settings) => {
          this.saving.set(false);
          this.notification.success('Clinic settings saved.');
          this.themeService.applyTheme(settings);
        },
        error: () => {
          this.saving.set(false);
          this.notification.error('Failed to save clinic settings.');
        }
      });
  }

  /** Live preview - applies the in-progress form values immediately, without waiting for Save. */
  previewTheme(): void {
    this.themeService.applyTheme({
      themePrimaryColor: this.form.themePrimaryColor || null,
      themeSecondaryColor: this.form.themeSecondaryColor || null,
      themeTertiaryColor: this.form.themeTertiaryColor || null,
      fontFamily: this.form.fontFamily || null,
      cornerRadiusStyle: this.form.cornerRadiusStyle,
      themeMode: this.form.themeMode,
      headerBackgroundColor: this.form.headerBackgroundColor || null,
      footerBackgroundColor: this.form.footerBackgroundColor || null
    });
  }
}
