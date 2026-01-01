import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-features-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="features-section" [ngStyle]="getSectionStyles()">
      <div class="container">
        <div class="features-header" *ngIf="config.title || config.subtitle">
          <h2 *ngIf="config.title" [style.color]="config.titleColor || '#1a202c'">{{ config.title }}</h2>
          <p *ngIf="config.subtitle" class="subtitle" [style.color]="config.subtitleColor || '#718096'">{{ config.subtitle }}</p>
        </div>
        
        <div class="features-grid" [style.gap]="config.gridGap || '2rem'">
          <div class="feature-item" *ngFor="let feature of config.features" [ngStyle]="getCardStyles()">
            <div class="feature-icon" [ngStyle]="getIconStyles()">
              <i [class]="feature.icon"></i>
            </div>
            <h3 [style.color]="config.cardTitleColor || '#2d3748'">{{ feature.title }}</h3>
            <p [style.color]="config.cardDescriptionColor || '#718096'">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features-section {
      padding: 3rem 1rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .features-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .features-header h2 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    
    .feature-item {
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .feature-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    
    .feature-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
    }
    
    .feature-item h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }
    
    .feature-item p {
      line-height: 1.6;
      margin: 0;
    }
  `]
})
export class FeaturesGridComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    title: 'Por que escolher a gente?',
    subtitle: '',
    features: []
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  getSectionStyles(): any {
    return {
      backgroundColor: this.config.backgroundColor || this.style?.backgroundColor || '#ffffff',
      padding: this.config.padding || this.style?.padding || '5rem 0',
      ...this.style
    };
  }

  getCardStyles(): any {
    return {
      backgroundColor: this.config.cardBackground || '#ffffff',
      border: `1px solid ${this.config.cardBorderColor || 'transparent'}`,
      boxShadow: this.config.cardShadow || '0 2px 8px rgba(0,0,0,0.05)'
    };
  }

  getIconStyles(): any {
    return {
      background: this.config.iconBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      width: this.config.iconSize || '80px',
      height: this.config.iconSize || '80px'
    };
  }

  getStyles(): string {
    const styles: string[] = [];
    if (this.style?.backgroundColor) styles.push(`background-color: ${this.style.backgroundColor}`);
    if (this.style?.padding) styles.push(`padding: ${this.style.padding}`);
    if (this.style?.margin) styles.push(`margin: ${this.style.margin}`);
    return styles.join('; ');
  }
}
