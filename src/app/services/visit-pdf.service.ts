import { Injectable } from '@angular/core';
import { VisitWithDetails, VisitProperty, VisitEvaluation } from '../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitPdfService {

  // Configuration constants
  private readonly IMAGE_LOAD_TIMEOUT_MS = 2000;

  constructor() {}

  /**
   * Generates a PDF document for a visit by creating an HTML document
   * and opening it in a new window for browser-based printing.
   * This approach is compatible with Chromium/Puppeteer PDF engines.
   */
  generateVisitPdf(visit: VisitWithDetails): void {
    const htmlContent = this.generateHtmlContent(visit);
    this.openPrintWindow(htmlContent);
  }

  /**
   * Generates complete HTML document with embedded CSS.
   * Uses HTML tables for layout to ensure PDF compatibility.
   * Each property gets its own page with page-break-before.
   */
  private generateHtmlContent(visit: VisitWithDetails): string {
    const properties = visit.properties && visit.properties.length > 0 
      ? visit.properties 
      : [];

    const pagesHtml = properties.length > 0
      ? properties.map((property, index) => 
          this.generatePropertyPage(visit, property, index + 1, index > 0)
        ).join('')
      : this.generateEmptyPage(visit);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Roteiro de Visita - ${visit.visit_date || 'sem-data'}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
    `;
  }

  private openPrintWindow(htmlContent: string): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for images to load before printing
      // Check if there are any images in the document
      printWindow.onload = () => {
        const images = printWindow.document.getElementsByTagName('img');
        if (images.length === 0) {
          // No images, print immediately
          printWindow.print();
          return;
        }

        // Wait for all images to load
        let loadedImages = 0;
        const totalImages = images.length;
        const checkAllLoaded = () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            printWindow.print();
          }
        };

        Array.from(images).forEach(img => {
          if (img.complete) {
            checkAllLoaded();
          } else {
            img.onload = checkAllLoaded;
            img.onerror = checkAllLoaded; // Continue even if image fails to load
          }
        });

        // Fallback timeout in case image loading detection fails
        setTimeout(() => {
          if (loadedImages < totalImages) {
            printWindow.print();
          }
        }, this.IMAGE_LOAD_TIMEOUT_MS);
      };
    }
  }

  private getStyles(): string {
    return `
      /* Reset and Base Styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Arial, sans-serif;  /* Standard font for PDF compatibility */
        font-size: 11pt;
        line-height: 1.4;  /* Adequate spacing to prevent text overlap */
        color: #000;
        background: white;
      }

      .page {
        width: 210mm;  /* A4 width */
        min-height: 297mm;  /* A4 height */
        padding: 15mm;
        margin: 0 auto;
        background: white;
        position: relative;
      }

      .page-break {
        page-break-before: always;  /* Force new page for each property */
      }

      /* Header - Uses table layout for proper alignment */
      .header-table {
        width: 100%;
        border: 1px solid #000;
        border-collapse: collapse;  /* Prevents double borders */
        margin-bottom: 10mm;
      }

      .header-table td {
        padding: 8px;
        vertical-align: top;
        border: none;
      }

      .logo-cell {
        width: 60px;
        text-align: center;
      }

      .logo-box {
        width: 50px;
        height: 50px;
        border: 1px solid #ccc;
        display: inline-block;
        overflow: hidden;  /* Contain logo within bounds */
      }

      .logo-box img {
        width: 100%;
        height: 100%;
        object-fit: contain;  /* Maintain logo aspect ratio */
      }

      .company-info {
        vertical-align: top;
      }

      .company-name {
        font-size: 13pt;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .company-detail {
        font-size: 10pt;
        margin-bottom: 2px;
      }

      .broker-info {
        text-align: right;
        vertical-align: top;
      }

      .broker-title {
        font-size: 11pt;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .broker-detail {
        font-size: 10pt;
        margin-bottom: 2px;
      }

      /* Title */
      .title {
        text-align: center;
        font-size: 16pt;
        font-weight: bold;
        margin-bottom: 10mm;
      }

      /* Sections */
      .section {
        margin-bottom: 8mm;
      }

      .section-title-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0;
      }

      .section-title-table td {
        background-color: #f0f0f0;
        border: 1px solid #000;
        padding: 6px 8px;
        font-weight: bold;
        font-size: 11pt;
      }

      .section-content-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
        border-top: none;
      }

      .section-content-table td {
        padding: 6px 8px;
        border-left: 1px solid #000;
        border-right: 1px solid #000;
        vertical-align: top;
      }

      .section-content-table tr:last-child td {
        border-bottom: 1px solid #000;
      }

      .label {
        font-weight: bold;
        display: inline-block;
        margin-right: 6px;
      }

      .value {
        display: inline;
      }

      /* Data grid for specs */
      .data-grid {
        width: 100%;
        border-collapse: collapse;
      }

      .data-grid td {
        padding: 4px 0;
        border: none;
      }

      .data-row {
        margin-bottom: 4px;
      }

      /* Rating boxes */
      .rating-container {
        margin: 8px 0;
      }

      .rating-label {
        font-weight: bold;
        margin-bottom: 4px;
        display: block;
      }

      .rating-boxes {
        display: inline-block;
      }

      .rating-box {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 1px solid #000;
        margin-right: 4px;
        text-align: center;
        line-height: 20px;
        font-size: 9pt;
        vertical-align: middle;
      }

      .rating-box.filled {
        background-color: #000;
        color: #fff;
      }

      /* Checkbox - CSS-based, no Unicode characters */
      .checkbox-container {
        margin: 8px 0;
      }

      .checkbox-label {
        font-weight: bold;
        margin-bottom: 4px;
        display: block;
      }

      .checkbox-option {
        display: inline-block;
        margin-right: 15px;
        margin-bottom: 6px;
      }

      .checkbox-box {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 1px solid #000;  /* Simple border creates checkbox */
        margin-right: 4px;
        vertical-align: middle;
        position: relative;
      }

      .checkbox-box.checked::before {
        content: 'X';  /* Simple X mark, not Unicode */
        position: absolute;
        top: -2px;
        left: 2px;
        font-size: 12pt;
        font-weight: bold;
      }

      .checkbox-text {
        display: inline;
        vertical-align: middle;
        font-size: 10pt;
      }

      /* Declaration */
      .declaration {
        text-align: justify;
        margin: 10mm 0;
        font-size: 10pt;
        line-height: 1.5;
      }

      /* Signatures */
      .signatures-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15mm;
      }

      .signatures-table td {
        text-align: center;
        padding: 0 10px;
        vertical-align: bottom;
        border: none;
      }

      .signature-line {
        border-top: 1px solid #000;
        padding-top: 6px;
        font-size: 9pt;
        margin-top: 30px;
      }

      /* Footer */
      .footer {
        text-align: center;
        font-size: 8pt;
        margin-top: 15mm;
        color: #666;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .page {
          margin: 0;
          padding: 15mm;
          page-break-after: always;
        }

        .page:last-child {
          page-break-after: auto;
        }

        .page-break {
          page-break-before: always;
        }
      }
    `;
  }

  private generatePropertyPage(visit: VisitWithDetails, property: VisitProperty, propertyNumber: number, addPageBreak: boolean): string {
    const pageBreakClass = addPageBreak ? ' page-break' : '';
    
    return `
<div class="page${pageBreakClass}">
  ${this.generateHeader(visit)}
  
  <div class="title">ROTEIRO DE VISITA</div>
  
  ${this.generateVisitDataSection(visit)}
  
  ${this.generateParticipantsSection(visit)}
  
  ${this.generatePropertyDataSection(property, propertyNumber)}
  
  ${this.generateEvaluationSection(visit, property)}
  
  ${this.generateDeclaration()}
  
  ${this.generateSignatures()}
  
  ${this.generateFooter()}
</div>
    `;
  }

  private generateEmptyPage(visit: VisitWithDetails): string {
    return `
<div class="page">
  ${this.generateHeader(visit)}
  
  <div class="title">ROTEIRO DE VISITA</div>
  
  ${this.generateVisitDataSection(visit)}
  
  <div style="text-align: center; margin-top: 30mm; font-style: italic; color: #666;">
    Nenhum imóvel vinculado a esta visita.
  </div>
  
  ${this.generateFooter()}
</div>
    `;
  }

  /**
   * Generates HTML for header with company logo and information.
   * Logo is displayed from URL (company_logo_url) - supports absolute URLs or base64.
   * If logo fails to load or URL is invalid, a placeholder is shown.
   */
  private generateHeader(visit: VisitWithDetails): string {
    // Validate and sanitize logo URL
    let logoHtml = '<div style="padding: 15px; font-size: 8pt; color: #999;">LOGO</div>';
    
    if (visit.company_logo_url && typeof visit.company_logo_url === 'string') {
      const url = visit.company_logo_url.trim();
      
      // Validate URL format
      const isValidUrl = this.isValidLogoUrl(url);
      if (isValidUrl) {
        // Use a div wrapper to hide on error instead of inline handler
        logoHtml = `<img src="${this.escapeHtml(url)}" alt="Logo" style="display: block;" />`;
      }
    }

    return `
<table class="header-table">
  <tr>
    <td class="logo-cell">
      <div class="logo-box">
        ${logoHtml}
      </div>
    </td>
    <td class="company-info">
      <div class="company-name">${this.escapeHtml(visit.company_name || 'Imobiliária')}</div>
      ${visit.company_address ? `<div class="company-detail">${this.escapeHtml(visit.company_address)}</div>` : ''}
      ${visit.company_phone ? `<div class="company-detail">Tel: ${this.escapeHtml(visit.company_phone)}</div>` : ''}
      ${visit.company_creci ? `<div class="company-detail">CRECI: ${this.escapeHtml(visit.company_creci)}</div>` : ''}
    </td>
    <td class="broker-info">
      ${visit.broker_name ? `
        <div class="broker-title">Corretor Responsável</div>
        <div class="broker-detail">${this.escapeHtml(visit.broker_name)}</div>
        ${visit.broker_creci ? `<div class="broker-detail">CRECI: ${this.escapeHtml(visit.broker_creci)}</div>` : ''}
        ${visit.broker_phone ? `<div class="broker-detail">Tel: ${this.escapeHtml(visit.broker_phone)}</div>` : ''}
      ` : ''}
    </td>
  </tr>
</table>
    `;
  }

  private generateVisitDataSection(visit: VisitWithDetails): string {
    const visitDate = visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('pt-BR') : '-';
    const visitTime = visit.visit_time || '-';
    const status = this.formatStatus(visit.status);
    const notes = visit.notes ? this.escapeHtml(visit.notes) : '';
    const notesRow = notes
      ? `
    <tr>
      <td colspan="3">
        <span class="label">Observações:</span>
        <span class="value">${notes}</span>
      </td>
    </tr>
      `
      : '';

    return `
<div class="section">
  <table class="section-title-table">
    <tr><td>Dados da Visita</td></tr>
  </table>
  <table class="section-content-table">
    <tr>
      <td style="width: 33%;">
        <span class="label">Data:</span>
        <span class="value">${visitDate}</span>
      </td>
      <td style="width: 33%;">
        <span class="label">Horário:</span>
        <span class="value">${visitTime}</span>
      </td>
      <td style="width: 34%;">
        <span class="label">Status:</span>
        <span class="value">${status}</span>
      </td>
    </tr>
    ${notesRow}
  </table>
</div>
    `;
  }

  /**
   * Generates participants section with Cliente and Corretor.
   * Note: Owner (Proprietário) information is intentionally excluded from this section
   * as per requirements - owner signature was also removed from the document.
   */
  private generateParticipantsSection(visit: VisitWithDetails): string {
    return `
<div class="section">
  <table class="section-title-table">
    <tr><td>Participantes</td></tr>
  </table>
  <table class="section-content-table">
    <tr>
      <td>
        <div class="data-row">
          <span class="label">Cliente:</span>
          <span class="value">${this.escapeHtml(visit.client_name || '-')}</span>
        </div>
        <div class="data-row">
          <span class="label">Corretor:</span>
          <span class="value">${this.escapeHtml(visit.broker_name || '-')}</span>
        </div>
      </td>
    </tr>
  </table>
</div>
    `;
  }

  private generatePropertyDataSection(property: VisitProperty, propertyNumber: number): string {
    const value = property.suggested_sale_value 
      ? 'R$ ' + property.suggested_sale_value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '-';

    return `
<div class="section">
  <table class="section-title-table">
    <tr><td>Dados do Imóvel ${propertyNumber}</td></tr>
  </table>
  <table class="section-content-table">
    <tr>
      <td>
        <div class="data-row">
          <span class="label">Referência:</span>
          <span class="value">${this.escapeHtml(property.property_reference || '-')}</span>
        </div>
        <div class="data-row">
          <span class="label">Endereço:</span>
          <span class="value">${this.escapeHtml(property.full_address || '-')}</span>
        </div>
        ${property.development ? `
        <div class="data-row">
          <span class="label">Empreendimento:</span>
          <span class="value">${this.escapeHtml(property.development)}</span>
        </div>
        ` : ''}
        
        <table class="data-grid" style="margin-top: 8px;">
          <tr>
            <td style="width: 33%;">
              <span class="label">Dormitórios:</span>
              <span class="value">${property.bedrooms?.toString() || '-'}</span>
            </td>
            <td style="width: 33%;">
              <span class="label">Suítes:</span>
              <span class="value">${property.suites?.toString() || '-'}</span>
            </td>
            <td style="width: 34%;">
              <span class="label">Banheiros:</span>
              <span class="value">${property.bathrooms?.toString() || '-'}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">Vagas:</span>
              <span class="value">${property.parking_spaces?.toString() || '-'}</span>
            </td>
            <td>
              <span class="label">Área Total:</span>
              <span class="value">${property.total_area ? property.total_area + ' m²' : '-'}</span>
            </td>
            <td>
              <span class="label">Área Construída:</span>
              <span class="value">${property.built_area ? property.built_area + ' m²' : '-'}</span>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <span class="label">Valor Sugerido:</span>
              <span class="value">${value}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
    `;
  }

  private generateEvaluationSection(visit: VisitWithDetails, property: VisitProperty): string {
    if (visit.status !== 'realizada' || !visit.evaluations) {
      return '';
    }

    const evaluation = visit.evaluations.find(e => e.property_id === property.id);
    if (!evaluation) {
      return '';
    }

    return `
<div class="section">
  <table class="section-title-table">
    <tr><td>Avaliação do Imóvel</td></tr>
  </table>
  <table class="section-content-table">
    <tr>
      <td>
        ${this.generateRatingHtml('Estado de conservação:', evaluation.conservation_state)}
        ${this.generateRatingHtml('Localização:', evaluation.location_rating)}
        ${this.generateRatingHtml('Valor do imóvel:', evaluation.property_value_rating)}
        ${this.generateCheckboxesHtml('Interesse do cliente:', evaluation.interest_level)}
      </td>
    </tr>
  </table>
</div>
    `;
  }

  private generateRatingHtml(label: string, rating?: number): string {
    const boxes = [1, 2, 3, 4, 5].map(i => {
      const filled = rating && i <= rating ? ' filled' : '';
      return `<div class="rating-box${filled}">${i}</div>`;
    }).join('');

    return `
<div class="rating-container">
  <span class="rating-label">${label}</span>
  <div class="rating-boxes">${boxes}</div>
</div>
    `;
  }

  private generateCheckboxesHtml(label: string, interestLevel?: string): string {
    const options = [
      { label: 'Descartou', value: 'DESCARTOU' },
      { label: 'Interessou', value: 'INTERESSOU' },
      { label: 'Interessou e assinou proposta', value: 'INTERESSOU_E_ASSINOU_PROPOSTA' }
    ];

    const optionsHtml = options.map(option => {
      const checked = interestLevel === option.value ? ' checked' : '';
      return `
<span class="checkbox-option">
  <span class="checkbox-box${checked}"></span>
  <span class="checkbox-text">${option.label}</span>
</span>
      `;
    }).join('');

    return `
<div class="checkbox-container">
  <span class="checkbox-label">${label}</span>
  <div>${optionsHtml}</div>
</div>
    `;
  }

  private generateDeclaration(): string {
    return `
<div class="declaration">
  Na qualidade de possível comprador, declaro para os devidos fins que visitei o imóvel acima descrito por intermédio da imobiliária, estando ciente das condições apresentadas.
</div>
    `;
  }

  /**
   * Generates signature section with only Cliente and Corretor.
   * Proprietário signature removed as per requirements.
   */
  private generateSignatures(): string {
    return `
<table class="signatures-table">
  <tr>
    <td style="width: 50%;">
      <div class="signature-line">Assinatura do Cliente</div>
    </td>
    <td style="width: 50%;">
      <div class="signature-line">Assinatura do Corretor</div>
    </td>
  </tr>
</table>
    `;
  }

  private generateFooter(): string {
    const timestamp = new Date().toLocaleString('pt-BR');
    return `
<div class="footer">
  Gerado em ${timestamp}
</div>
    `;
  }

  private formatStatus(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'agendada': 'Agendada',
      'confirmada': 'Confirmada',
      'realizada': 'Realizada',
      'cancelada': 'Cancelada'
    };
    return statusMap[status || ''] || status || '-';
  }

  /**
   * Escapes HTML special characters to prevent XSS attacks.
   * Uses browser's built-in text content mechanism for safe escaping.
   */
  private escapeHtml(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = text; // textContent automatically escapes HTML
    return div.innerHTML;
  }

  /**
   * Validates if a URL is safe to use as a logo source.
   * Allows HTTP(S) URLs and base64 data URLs with image MIME types.
   */
  private isValidLogoUrl(url: string): boolean {
    if (!url) return false;

    // Allow data URLs with image MIME types
    if (url.startsWith('data:image/')) {
      const validImageTypes = ['jpeg', 'jpg', 'png', 'gif', 'svg+xml', 'webp'];
      return validImageTypes.some(type => url.startsWith(`data:image/${type}`));
    }

    // Allow HTTP(S) URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        // Additional validation using URL constructor
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }
}

