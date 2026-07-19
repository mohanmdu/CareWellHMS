import { Component, inject } from '@angular/core';
import { SiteConfigService } from '../../core/services/site-config.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly siteConfig = inject(SiteConfigService);
  config = this.siteConfig.config;

  whatsappLink(number: string): string {
    return `https://wa.me/${number.replace(/\D/g, '')}`;
  }
}
