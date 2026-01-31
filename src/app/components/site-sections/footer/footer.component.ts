import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../models/site-config.model';
import { TemplateSection, TemplateTheme } from '../../../models/template-definition.model';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-section-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() config: SiteConfig | null = null;
  @Input() theme: TemplateTheme | null = null;
  @Input() section: TemplateSection | null = null;
  @Input() properties: Property[] = [];

  get variant(): string {
    return this.section?.variant || 'default';
  }

  year = new Date().getFullYear();
}
