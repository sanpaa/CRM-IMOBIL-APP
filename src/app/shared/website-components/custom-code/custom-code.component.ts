import { Component, Input, OnInit, ElementRef, ViewChild, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-custom-code',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="custom-code-section" [style]="getStyles()">
      <div class="container" #codeContainer>
        <div class="custom-html" [innerHTML]="sanitizedHtml"></div>
      </div>
    </section>
  `,
  styles: [`
    .custom-code-section {
      padding: 2rem 1rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .custom-html {
      width: 100%;
    }
  `]
})
export class CustomCodeComponent implements WebsiteComponentBase, OnInit {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    html: '',
    css: '',
    js: '',
    enableJs: false
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;
  
  @ViewChild('codeContainer', { static: false }) codeContainer?: ElementRef;
  
  sanitizedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, this.config.html || '') || '';
    this.injectStyles();
  }

  ngAfterViewInit(): void {
    if (this.config.enableJs && !this.editMode) {
      this.injectScript();
    }
  }

  private injectStyles(): void {
    if (!this.config.css) return;
    
    const styleId = `custom-style-${this.sectionId}`;
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = this.config.css;
  }

  private injectScript(): void {
    if (!this.config.js || !this.config.enableJs) return;
    
    // ⚠️ AVISO DE SEGURANÇA: Só execute em produção com código confiável
    try {
      const scriptId = `custom-script-${this.sectionId}`;
      let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.textContent = this.config.js;
        this.codeContainer?.nativeElement.appendChild(scriptElement);
      }
    } catch (error) {
      console.error('Error injecting custom script:', error);
    }
  }

  getStyles(): string {
    const styles: string[] = [];
    if (this.style?.backgroundColor) styles.push(`background-color: ${this.style.backgroundColor}`);
    if (this.style?.padding) styles.push(`padding: ${this.style.padding}`);
    if (this.style?.margin) styles.push(`margin: ${this.style.margin}`);
    return styles.join('; ');
  }
}
