import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ],
  template: `
    <section class="faq-section" [ngStyle]="getSectionStyles()">
      <div class="container">
        <div class="faq-header" *ngIf="config.title || config.subtitle">
          <h2 *ngIf="config.title" [style.color]="config.titleColor || '#1a202c'">{{ config.title }}</h2>
          <p *ngIf="config.subtitle" class="subtitle" [style.color]="config.subtitleColor || '#718096'">{{ config.subtitle }}</p>
        </div>
        
        <div class="faq-items">
          <div class="faq-item" *ngFor="let item of config.items; let i = index" 
               [class.active]="activeIndex === i"
               [ngStyle]="getItemStyles()"
               (click)="toggle(i)">
            <div class="faq-question">
              <h3 [style.color]="config.questionColor || '#2d3748'">{{ item.question }}</h3>
              <span class="icon" [style.color]="config.accentColor || '#2c7a7b'">{{ activeIndex === i ? '−' : '+' }}</span>
            </div>
            <div class="faq-answer" *ngIf="activeIndex === i" [@expandCollapse]>
              <p [style.color]="config.answerColor || '#4a5568'">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .faq-section {
      padding: 3rem 1rem;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .faq-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .faq-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.1rem;
    }
    
    .faq-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .faq-item {
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .faq-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .faq-question {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .faq-question h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .icon {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .faq-answer {
      padding: 0 1.5rem 1.5rem;
      animation: fadeIn 0.3s;
    }
    
    .faq-answer p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FAQComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    title: 'Perguntas Frequentes',
    subtitle: '',
    items: []
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  activeIndex: number = -1;

  toggle(index: number): void {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }

  getSectionStyles(): any {
    return {
      backgroundColor: this.config.backgroundColor || this.style?.backgroundColor || '#f9fafb',
      padding: this.config.padding || this.style?.padding || '4rem 0',
      ...this.style
    };
  }

  getItemStyles(): any {
    return {
      backgroundColor: this.config.cardBackground || '#ffffff',
      border: `1px solid ${this.config.borderColor || '#e2e8f0'}`,
      boxShadow: this.config.boxShadow || 'none'
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
