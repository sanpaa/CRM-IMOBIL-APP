import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-mortgage-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="calculator-section" [ngStyle]="getSectionStyles()">
      <div class="container">
        <div class="calculator-header" *ngIf="config.title || config.subtitle">
          <h2 *ngIf="config.title" [style.color]="config.titleColor || '#1a202c'">{{ config.title }}</h2>
          <p *ngIf="config.subtitle" class="subtitle" [style.color]="config.subtitleColor || '#718096'">{{ config.subtitle }}</p>
        </div>
        
        <div class="calculator-content" [ngStyle]="getContentStyles()">
          <div class="calculator-inputs">
            <div class="input-group">
              <label [style.color]="config.labelColor || '#2d3748'">{{ getLabel('propertyValue') }}</label>
              <input type="number" [(ngModel)]="propertyValue" (ngModelChange)="calculate()" 
                     min="0" step="10000" [ngStyle]="getInputStyles()" />
            </div>
            
            <div class="input-group">
              <label [style.color]="config.labelColor || '#2d3748'">{{ getLabel('downPayment') }}</label>
              <input type="number" [(ngModel)]="downPayment" (ngModelChange)="calculate()" 
                     min="0" step="5000" [ngStyle]="getInputStyles()" />
            </div>
            
            <div class="input-group">
              <label [style.color]="config.labelColor || '#2d3748'">{{ getLabel('interestRate') }}</label>
              <input type="number" [(ngModel)]="interestRate" (ngModelChange)="calculate()" 
                     min="0" max="30" step="0.1" [ngStyle]="getInputStyles()" />
            </div>
            
            <div class="input-group">
              <label [style.color]="config.labelColor || '#2d3748'">{{ getLabel('loanTerm') }}</label>
              <input type="number" [(ngModel)]="termYears" (ngModelChange)="calculate()" 
                     min="1" max="35" [ngStyle]="getInputStyles()" />
            </div>
          </div>
          
          <div class="calculator-results" *ngIf="monthlyPayment > 0">
            <div class="result-item highlight" [ngStyle]="getHighlightStyles()">
              <span class="label">{{ getLabel('monthlyPayment') }}</span>
              <span class="value">{{ formatCurrency(monthlyPayment) }}</span>
            </div>
            
            <div class="result-item" [ngStyle]="getResultStyles()">
              <span class="label">{{ getLabel('financedAmount') }}</span>
              <span class="value">{{ formatCurrency(financedAmount) }}</span>
            </div>
            
            <div class="result-item" [ngStyle]="getResultStyles()">
              <span class="label">{{ getLabel('totalInterest') }}</span>
              <span class="value">{{ formatCurrency(totalInterest) }}</span>
            </div>
            
            <div class="result-item" [ngStyle]="getResultStyles()">
              <span class="label">{{ getLabel('totalAmount') }}</span>
              <span class="value">{{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .calculator-section {
      padding: 3rem 1rem;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .calculator-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .calculator-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.1rem;
    }
    
    .calculator-content {
      padding: 2rem;
      border-radius: 12px;
    }
    
    .calculator-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
    }
    
    .input-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .input-group input {
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .input-group input:focus {
      outline: none;
    }
    
    .calculator-results {
      padding-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
    }
    
    .result-item.highlight {
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .result-item .label {
      font-weight: 600;
    }
    
    .result-item .value {
      font-size: 1.3rem;
    }
    
    .result-item.highlight .value {
      font-size: 1.5rem;
    }
    
    @media (max-width: 600px) {
      .calculator-inputs {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MortgageCalculatorComponent implements WebsiteComponentBase, OnInit {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    title: 'Calculadora de Financiamento',
    subtitle: '',
    defaultInterestRate: 9.5,
    defaultTermYears: 30
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  propertyValue: number = 500000;
  downPayment: number = 100000;
  interestRate: number = 9.5;
  termYears: number = 30;
  
  monthlyPayment: number = 0;
  financedAmount: number = 0;
  totalInterest: number = 0;
  totalAmount: number = 0;

  ngOnInit(): void {
    this.propertyValue = this.config.defaultPropertyValue || 300000;
    this.downPayment = this.config.defaultDownPayment || 60000;
    this.interestRate = this.config.defaultInterestRate || 9.5;
    this.termYears = this.config.defaultLoanTerm || 30;
    this.calculate();
  }

  getLabel(key: string): string {
    const labels = this.config.labels || {};
    const defaultLabels: any = {
      propertyValue: 'Valor do Imóvel (R$)',
      downPayment: 'Entrada (R$)',
      interestRate: 'Taxa de Juros (% ao ano)',
      loanTerm: 'Prazo (anos)',
      monthlyPayment: 'Parcela Mensal',
      financedAmount: 'Valor Financiado',
      totalInterest: 'Juros Totais',
      totalAmount: 'Total a Pagar'
    };
    return labels[key] || defaultLabels[key];
  }

  formatCurrency(value: number): string {
    const currency = this.config.currency || 'BRL';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: currency 
    }).format(value);
  }

  getSectionStyles(): any {
    return {
      backgroundColor: this.config.backgroundColor || this.style?.backgroundColor || '#f9fafb',
      padding: this.config.padding || this.style?.padding || '5rem 0',
      ...this.style
    };
  }

  getContentStyles(): any {
    return {
      backgroundColor: this.config.contentBackground || '#ffffff',
      boxShadow: this.config.boxShadow || '0 4px 12px rgba(0,0,0,0.1)'
    };
  }

  getInputStyles(): any {
    return {
      border: `2px solid ${this.config.inputBorderColor || '#e2e8f0'}`,
      backgroundColor: this.config.inputBackground || 'white',
      color: this.config.inputColor || '#2d3748'
    };
  }

  getHighlightStyles(): any {
    return {
      background: this.config.primaryColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: this.config.highlightTextColor || 'white'
    };
  }

  getResultStyles(): any {
    return {
      backgroundColor: this.config.resultBackground || '#f8f9fa',
      color: this.config.resultTextColor || '#2d3748'
    };
  }

  calculate(): void {
    this.financedAmount = this.propertyValue - this.downPayment;
    
    if (this.financedAmount <= 0) {
      this.monthlyPayment = 0;
      this.totalInterest = 0;
      this.totalAmount = 0;
      return;
    }
    
    const monthlyRate = (this.interestRate / 100) / 12;
    const numPayments = this.termYears * 12;
    
    // Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const payment = this.financedAmount * 
                   (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    this.monthlyPayment = payment;
    this.totalAmount = payment * numPayments;
    this.totalInterest = this.totalAmount - this.financedAmount;
  }

  getStyles(): string {
    const styles: string[] = [];
    if (this.style?.backgroundColor) styles.push(`background-color: ${this.style.backgroundColor}`);
    if (this.style?.padding) styles.push(`padding: ${this.style.padding}`);
    if (this.style?.margin) styles.push(`margin: ${this.style.margin}`);
    return styles.join('; ');
  }
}
