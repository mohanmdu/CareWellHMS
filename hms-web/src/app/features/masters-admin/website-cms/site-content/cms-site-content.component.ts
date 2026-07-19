import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { CmsSiteContentService } from './cms-site-content.service';

/** About Us / Mission / Vision / Home Intro body text for the public website's homepage. */
@Component({
  selector: 'app-cms-site-content',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, PageHeaderComponent],
  templateUrl: './cms-site-content.component.html',
  styleUrl: './cms-site-content.component.scss'
})
export class CmsSiteContentComponent {
  private readonly service = inject(CmsSiteContentService);
  private readonly notification = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);

  form = {
    aboutUsBody: '',
    missionBody: '',
    visionBody: '',
    homeIntroTitle: '',
    homeIntroBody: ''
  };

  constructor() {
    this.service.get().subscribe({
      next: (content) => {
        this.form = {
          aboutUsBody: content.aboutUsBody ?? '',
          missionBody: content.missionBody ?? '',
          visionBody: content.visionBody ?? '',
          homeIntroTitle: content.homeIntroTitle ?? '',
          homeIntroBody: content.homeIntroBody ?? ''
        };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load site content.');
      }
    });
  }

  save(): void {
    this.saving.set(true);
    this.service
      .update({
        aboutUsBody: this.form.aboutUsBody.trim() || null,
        missionBody: this.form.missionBody.trim() || null,
        visionBody: this.form.visionBody.trim() || null,
        homeIntroTitle: this.form.homeIntroTitle.trim() || null,
        homeIntroBody: this.form.homeIntroBody.trim() || null
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Site content saved.');
        },
        error: () => {
          this.saving.set(false);
          this.notification.error('Failed to save site content.');
        }
      });
  }
}
