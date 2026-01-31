import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../models/site-config.model';
import { TemplateSection, TemplateTheme } from '../../../models/template-definition.model';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() config: SiteConfig | null = null;
  @Input() theme: TemplateTheme | null = null;
  @Input() section: TemplateSection | null = null;
  @Input() properties: Property[] = [];

  get variant(): string {
    return this.section?.variant || 'default';
  }
}
