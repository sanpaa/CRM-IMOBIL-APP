import { Injectable } from '@angular/core';

/**
 * Style Validation Service
 * Valida propriedades CSS e previne injeção de código malicioso
 */
@Injectable({
  providedIn: 'root'
})
export class StyleValidationService {

  /**
   * Valida se uma cor CSS é válida
   */
  isValidColor(color: string): boolean {
    if (!color || typeof color !== 'string') return false;

    const patterns = [
      /^#[0-9A-Fa-f]{6}$/,  // Hex (#FF5733)
      /^#[0-9A-Fa-f]{3}$/,  // Hex curto (#F57)
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,  // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,  // RGBA
      /^[a-z]+$/i,  // Named colors (white, black, red)
      /^linear-gradient\(/i,  // Linear gradient
      /^radial-gradient\(/i,  // Radial gradient
      /^transparent$/i  // Transparent
    ];

    return patterns.some(pattern => pattern.test(color));
  }

  /**
   * Valida se uma unidade de medida CSS é válida
   */
  isValidCSSUnit(value: string): boolean {
    if (!value || typeof value !== 'string') return false;

    const pattern = /^\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|pt|cm|mm|in)?$/;
    return pattern.test(value) || value === 'auto';
  }

  /**
   * Valida propriedade CSS genérica
   */
  isValidCSSProperty(property: string, value: any): boolean {
    if (!value) return true; // Valores vazios são permitidos

    const stringValue = String(value);

    // Lista de propriedades CSS comuns
    const safeProperties = [
      'color', 'backgroundColor', 'background',
      'padding', 'margin', 'border', 'borderRadius',
      'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
      'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
      'display', 'flexDirection', 'justifyContent', 'alignItems',
      'gridTemplateColumns', 'gridTemplateRows', 'gap',
      'textAlign', 'textDecoration', 'textTransform',
      'opacity', 'transform', 'transition', 'animation',
      'boxShadow', 'textShadow', 'overflow', 'position',
      'top', 'right', 'bottom', 'left', 'zIndex'
    ];

    // Previne código JavaScript em CSS
    const dangerousPatterns = [
      /javascript:/i,
      /expression\(/i,
      /<script/i,
      /on\w+\s*=/i  // onclick=, onload=, etc.
    ];

    if (dangerousPatterns.some(pattern => pattern.test(stringValue))) {
      console.warn(`Dangerous CSS value detected: ${stringValue}`);
      return false;
    }

    return true;
  }

  /**
   * Sanitiza CSS customizado (remove código perigoso)
   */
  sanitizeCSS(css: string): string {
    if (!css || typeof css !== 'string') return '';

    let sanitized = css;

    // Remove @import
    sanitized = sanitized.replace(/@import\s+.*?;/gi, '');

    // Remove url() com javascript:
    sanitized = sanitized.replace(/url\s*\(\s*['""]?\s*javascript:/gi, 'url(about:blank');

    // Remove expression (IE specific)
    sanitized = sanitized.replace(/expression\s*\(/gi, '');

    // Remove comportamentos perigosos
    sanitized = sanitized.replace(/<script.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized;
  }

  /**
   * Sanitiza HTML (remove scripts e tags perigosas)
   */
  sanitizeHTML(html: string, allowJS: boolean = false): string {
    if (!html || typeof html !== 'string') return '';

    if (allowJS) {
      // Se JS permitido, apenas log (responsabilidade do superuser)
      console.log('HTML with JavaScript enabled - Admin responsibility');
      return html;
    }

    // Remove tags script
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers inline
    sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: em hrefs e src
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

    return sanitized;
  }

  /**
   * Valida objeto de estilo completo
   */
  validateStyleObject(style: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!style || typeof style !== 'object') {
      return { valid: true, errors: [] };
    }

    for (const [property, value] of Object.entries(style)) {
      if (!this.isValidCSSProperty(property, value)) {
        errors.push(`Invalid CSS property: ${property}=${value}`);
      }

      // Validações específicas
      if (property.toLowerCase().includes('color') || property === 'background') {
        if (typeof value === 'string' && !this.isValidColor(value)) {
          errors.push(`Invalid color value: ${property}=${value}`);
        }
      }

      if (['padding', 'margin', 'width', 'height', 'fontSize'].includes(property)) {
        if (typeof value === 'string' && !this.isValidCSSUnit(value)) {
          errors.push(`Invalid CSS unit: ${property}=${value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Aplica limite de tamanho para código customizado
   */
  validateCodeSize(code: string, maxSizeKB: number = 50): { valid: boolean; size: number } {
    if (!code) return { valid: true, size: 0 };

    const sizeKB = new Blob([code]).size / 1024;
    return {
      valid: sizeKB <= maxSizeKB,
      size: Math.round(sizeKB * 100) / 100
    };
  }
}
