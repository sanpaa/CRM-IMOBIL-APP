import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface StatsItem {
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
}

export interface StatsSectionConfig {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  accentColor?: string;
  stats?: StatsItem[];
}

@Component({
  selector: 'app-stats-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-section.component.html',
  styleUrls: ['./stats-section.component.scss']
})
export class StatsSectionComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: StatsSectionConfig = {
    title: 'Resultados que comprovam',
    subtitle: 'Provas sociais que mostram nossa solidez no mercado',
    badgeText: 'Credibilidade',
    accentColor: '#0ea5e9',
    stats: []
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  getSectionStyles(): any {
    const backgroundValue = this.style?.background || this.style?.backgroundColor;
    const styles: any = {
      padding: this.style?.padding || '5rem 0',
      color: this.style?.textColor || 'inherit'
    };

    if (backgroundValue) {
      if (backgroundValue.includes('gradient') || backgroundValue.includes('url(')) {
        styles.background = backgroundValue;
      } else {
        styles.backgroundColor = backgroundValue;
      }
    }

    return styles;
  }

  getAccentColor(): string {
    return this.config.accentColor || '#0ea5e9';
  }

  getStats(): StatsItem[] {
    return this.config.stats && this.config.stats.length
      ? this.config.stats
      : [
          { value: '1200+', label: 'Imoveis ativos', description: 'Em carteira exclusiva' },
          { value: '18k', label: 'Leads qualificados', description: 'Gerados no ultimo ano' },
          { value: '97%', label: 'Conversao', description: 'Satisfacao comprovada' }
        ];
  }

  isIconClass(icon?: string): boolean {
    return !!icon && (icon.includes('fa') || icon.includes('bi') || icon.includes('mdi'));
  }
}
