import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';
import { NewsletterService } from '../../../services/newsletter.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="newsletter-section" [ngStyle]="getSectionStyles()">
      <div class="container">
        <div class="newsletter-content">
          <h2 *ngIf="config.title" [style.color]="config.titleColor || 'white'">{{ config.title }}</h2>
          <p *ngIf="config.subtitle" class="subtitle" [style.color]="config.subtitleColor || 'white'">{{ config.subtitle }}</p>
          
          <form class="newsletter-form" (ngSubmit)="onSubmit($event)">
            <input 
              type="email" 
              [(ngModel)]="email"
              name="email"
              [placeholder]="config.inputPlaceholder || 'Seu melhor email'"
              required
              class="email-input"
              [ngStyle]="getInputStyles()"
            />
            <button type="submit" class="submit-btn" [ngStyle]="getButtonStyles()">
              {{ config.buttonText || 'Assinar Newsletter' }}
            </button>
          </form>
          
          <p class="message" *ngIf="message" [class.success]="isSuccess" [style.color]="config.titleColor || 'white'">
            {{ message }}
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .newsletter-section {
      padding: 3rem 1rem;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .newsletter-content {
      text-align: center;
    }
    
    .newsletter-content h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .newsletter-form {
      display: flex;
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto 1rem;
    }
    
    .email-input {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
    }
    
    .email-input:focus {
      outline: 2px solid white;
      outline-offset: 2px;
    }
    
    .submit-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      white-space: nowrap;
    }
    
    .submit-btn:hover {
      transform: scale(1.05);
    }
    
    .message {
      margin-top: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
      background: rgba(255,255,255,0.2);
    }
    
    .message.success {
      background: rgba(76, 175, 80, 0.3);
    }
    
    @media (max-width: 600px) {
      .newsletter-form {
        flex-direction: column;
      }
    }
  `]
})
export class NewsletterComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    title: 'Fique por dentro das novidades',
    subtitle: '',
    buttonText: 'Assinar',
    inputPlaceholder: 'Digite seu e-mail'
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  email: string = '';
  message: string = '';
  isSuccess: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private newsletterService: NewsletterService,
    private authService: AuthService
  ) {}

  getSectionStyles(): any {
    return {
      background: this.config.background || this.style?.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: this.config.padding || this.style?.padding || '5rem 0',
      color: this.config.titleColor || 'white',
      ...this.style
    };
  }

  getInputStyles(): any {
    return {
      backgroundColor: this.config.inputBackground || 'white',
      color: this.config.inputColor || '#333333',
      borderColor: this.config.inputBorderColor || 'transparent'
    };
  }

  getButtonStyles(): any {
    return {
      backgroundColor: this.config.buttonBackground || 'white',
      color: this.config.buttonColor || '#667eea',
      opacity: this.isSubmitting ? 0.7 : 1,
      cursor: this.isSubmitting ? 'not-allowed' : 'pointer'
    };
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    if (!this.email || !this.email.includes('@')) {
      this.message = 'Por favor, insira um e-mail válido';
      this.isSuccess = false;
      return;
    }
    
    this.isSubmitting = true;
    this.message = '';
    
    try {
      // Get company ID from current user or config
      const user = this.authService.getCurrentUser();
      const companyId = user?.company_id || this.config.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      const result = await this.newsletterService.subscribe(
        this.email,
        companyId,
        this.config.source || 'website'
      );
      
      if (result.success) {
        this.message = result.message || 'Obrigado! Você será notificado sobre novidades.';
        this.isSuccess = true;
        this.email = '';
      } else {
        this.message = result.message || 'Erro ao realizar inscrição. Tente novamente.';
        this.isSuccess = false;
      }
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      this.message = 'Erro ao realizar inscrição. Tente novamente mais tarde.';
      this.isSuccess = false;
    } finally {
      this.isSubmitting = false;
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }

  getStyles(): string {
    const styles: string[] = [];
    if (this.style?.backgroundColor) styles.push(`background: ${this.style.backgroundColor}`);
    if (this.style?.textColor) styles.push(`color: ${this.style.textColor}`);
    if (this.style?.padding) styles.push(`padding: ${this.style.padding}`);
    if (this.style?.margin) styles.push(`margin: ${this.style.margin}`);
    return styles.join('; ');
  }
}
