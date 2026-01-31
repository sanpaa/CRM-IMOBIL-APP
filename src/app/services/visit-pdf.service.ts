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
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        --slate-900: #0F172A;
        --slate-800: #1E293B;
        --slate-600: #475569;
        --slate-500: #64748B;
        --slate-300: #CBD5E1;
        --slate-200: #E2E8F0;
        --slate-100: #F1F5F9;
        --slate-50: #F8FAFC;
        --blue-700: #1D4ED8;
        --blue-600: #2563EB;
        --green-100: #DCFCE7;
        --green-700: #166534;
        --color-bg-primary: #E9EEF5;
        --color-bg-secondary: #FFFFFF;
      }

      body {
        font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.4;
        color: var(--slate-800);
        background: #E9EEF5;
      }

      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        margin: 0 auto;
        background: #E9EEF5;
        position: relative;
      }

      .page-break {
        page-break-before: always;
      }

      .card {
        background: var(--color-bg-secondary);
        border-radius: 14px;
        border: 1px solid var(--slate-200);
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
        padding: 14px 18px 16px;
      }

      .card-header {
        border-bottom: 1px solid var(--slate-200);
        padding-bottom: 10px;
        margin-bottom: 12px;
      }

      .card-body {
        padding-bottom: 4px;
      }

      .header-table {
        width: 100%;
        border-collapse: collapse;
      }

      .header-table td {
        padding: 0;
        border: none;
        vertical-align: middle;
      }

      .header-left {
        width: 65%;
      }

      .header-right {
        width: 35%;
        text-align: right;
      }

      .broker-table {
        width: 100%;
        border-collapse: collapse;
      }

      .broker-avatar-cell {
        width: 52px;
        padding-right: 10px;
        vertical-align: middle;
      }

      .broker-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--slate-200);
        color: var(--slate-800);
        text-align: center;
        line-height: 42px;
        font-weight: 700;
        font-size: 11pt;
        overflow: hidden;
      }

      .broker-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .broker-name {
        font-size: 11.5pt;
        font-weight: 700;
        color: var(--slate-800);
      }

      .broker-role {
        font-size: 8.5pt;
        color: var(--slate-500);
      }

      .broker-phone {
        font-size: 8.5pt;
        color: var(--slate-600);
      }

      .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 7.5pt;
        font-weight: 700;
        letter-spacing: 0.6px;
        background: var(--blue-600);
        color: #FFFFFF;
        margin-bottom: 6px;
      }

      .header-title {
        font-size: 15pt;
        font-weight: 800;
        font-style: italic;
        letter-spacing: 1px;
        color: var(--slate-800);
        line-height: 1.1;
      }

      .section {
        margin-bottom: 10px;
      }

      .section-heading-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 6px;
      }

      .section-heading-icon {
        width: 14px;
        height: 14px;
        color: var(--blue-700);
        vertical-align: middle;
      }

      .section-heading-icon svg {
        width: 14px;
        height: 14px;
        display: block;
      }

      .section-heading-text {
        font-size: 8.5pt;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: var(--slate-800);
        padding-left: 6px;
        vertical-align: middle;
      }

      .section-card {
        background: var(--color-bg-primary);
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 10px 12px;
      }

      .field-label {
        font-weight: 700;
        color: var(--slate-500);
        font-size: 7.5pt;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        display: block;
        margin-bottom: 2px;
      }

      .field-value {
        color: var(--slate-800);
        font-weight: 700;
        font-size: 10pt;
        display: block;
      }

      .divider {
        height: 1px;
        background: var(--slate-200);
        margin: 8px 0;
      }

      .subsection {
        margin-top: 6px;
      }

      .info-grid {
        width: 100%;
        border-collapse: collapse;
      }

      .info-grid td {
        width: 33.33%;
        vertical-align: top;
        padding-right: 8px;
      }

      .info-grid td:last-child {
        padding-right: 0;
      }

      .status-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 8.5pt;
        font-weight: 700;
        background: var(--green-100);
        color: var(--green-700);
      }

      .status-icon {
        width: 10px;
        height: 10px;
        display: inline-block;
        vertical-align: -1px;
        margin-right: 4px;
      }

      .status-icon svg {
        width: 10px;
        height: 10px;
        display: block;
      }

      .visit-notes {
        font-style: italic;
        color: var(--slate-600);
        font-size: 9pt;
        margin-top: 2px;
      }

      .participants-table {
        width: 100%;
        border-collapse: collapse;
      }

      .participants-table td {
        width: 50%;
        vertical-align: top;
        padding: 0 6px;
      }

      .participants-table td:first-child {
        padding-left: 0;
      }

      .participants-table td:last-child {
        padding-right: 0;
      }

      .participant-card {
        background: var(--color-bg-secondary);
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 8px 10px;
        min-height: 64px;
      }

      .participant-table {
        width: 100%;
        border-collapse: collapse;
      }

      .participant-avatar-cell {
        width: 40px;
        padding-right: 8px;
        vertical-align: middle;
      }

      .participant-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--slate-200);
        color: var(--slate-800);
        text-align: center;
        line-height: 32px;
        font-weight: 700;
        font-size: 9.5pt;
        overflow: hidden;
      }

      .participant-role {
        font-size: 7.5pt;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        color: var(--slate-500);
        margin-bottom: 2px;
      }

      .participant-name {
        font-weight: 700;
        color: var(--slate-800);
        font-size: 10pt;
      }

      .property-top {
        width: 100%;
        border-collapse: collapse;
      }

      .property-left {
        width: 60%;
        vertical-align: top;
      }

      .property-right {
        width: 40%;
        text-align: right;
        vertical-align: top;
      }

      .property-reference {
        color: var(--blue-700);
        font-weight: 700;
      }

      .property-value {
        color: var(--slate-800);
        font-weight: 800;
      }

      .address-line {
        display: inline-block;
        color: var(--slate-600);
        font-size: 9pt;
      }

      .icon {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 4px;
        vertical-align: -1px;
        color: var(--slate-500);
      }

      .icon svg {
        width: 12px;
        height: 12px;
        display: inline-block;
      }

      .metrics-grid {
        width: 100%;
        border-collapse: collapse;
      }

      .metrics-grid td {
        width: 16.66%;
        text-align: center;
        vertical-align: top;
        padding-top: 6px;
      }

      .metric-icon {
        width: 16px;
        height: 16px;
        margin: 0 auto 4px;
        color: var(--slate-500);
      }

      .metric-icon svg {
        width: 16px;
        height: 16px;
        display: block;
        margin: 0 auto;
      }

      .metric-value {
        font-weight: 700;
        color: var(--blue-700);
        font-size: 9.5pt;
      }

      .metric-label {
        font-size: 7.5pt;
        color: var(--slate-500);
        text-transform: uppercase;
      }

      .rating-container {
        margin: 8px 0;
      }

      .rating-label {
        font-weight: 600;
        margin-bottom: 4px;
        display: block;
        color: var(--slate-500);
        font-size: 8.5pt;
      }

      .rating-boxes {
        display: inline-block;
      }

      .rating-box {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 1px solid var(--slate-300);
        margin-right: 4px;
        text-align: center;
        line-height: 18px;
        font-size: 8pt;
        vertical-align: middle;
        color: var(--slate-500);
      }

      .rating-box.filled {
        background-color: var(--blue-700);
        color: #FFFFFF;
        border-color: var(--blue-700);
      }

      .checkbox-container {
        margin: 8px 0;
      }

      .checkbox-label {
        font-weight: 600;
        margin-bottom: 4px;
        display: block;
        color: var(--slate-500);
        font-size: 8.5pt;
      }

      .checkbox-option {
        display: inline-block;
        margin-right: 12px;
        margin-bottom: 6px;
      }

      .checkbox-box {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 1px solid var(--slate-300);
        margin-right: 4px;
        vertical-align: middle;
        position: relative;
      }

      .checkbox-box.checked::before {
        content: 'X';
        position: absolute;
        top: -2px;
        left: 1px;
        font-size: 10pt;
        font-weight: bold;
        color: var(--slate-800);
      }

      .checkbox-text {
        display: inline;
        vertical-align: middle;
        font-size: 8.5pt;
        color: var(--slate-600);
      }

      .declaration-card {
        text-align: center;
        background: var(--color-bg-primary);
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 8.5pt;
        color: var(--slate-600);
        font-style: italic;
        margin: 10px 0 10px;
      }

      .signature-divider {
        border-top: 1px solid var(--slate-200);
        margin: 14px 0 12px;
      }

      .signatures-table {
        width: 100%;
        border-collapse: collapse;
      }

      .signatures-table td {
        width: 50%;
        text-align: center;
        vertical-align: top;
        padding: 0 10px;
      }

      .signature-block {
        min-height: 56px;
      }

      .signature-line {
        border-top: 1px solid var(--slate-300);
        padding-top: 8px;
        font-size: 8.5pt;
        color: var(--slate-600);
      }

      .signature-name {
        font-size: 8.5pt;
        color: var(--slate-800);
        margin-top: 4px;
        min-height: 12px;
      }

      .footer {
        width: 100%;
        border-collapse: collapse;
        font-size: 7.5pt;
        margin-top: 8px;
        color: var(--slate-500);
      }

      .footer-left {
        text-align: left;
      }

      .footer-right {
        text-align: right;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .page {
          margin: 0;
          padding: 20mm;
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
  <div class="card">
    <div class="card-header">
      ${this.generateHeader(visit)}
    </div>
    <div class="card-body">
      ${this.generateVisitDataSection(visit)}
      ${this.generateParticipantsSection(visit)}
      ${this.generatePropertyDataSection(property, propertyNumber)}
      ${this.generateEvaluationSection(visit, property)}
      ${this.generateDeclaration()}
    </div>
    <div class="signature-divider"></div>
    ${this.generateSignatures(visit)}
    ${this.generateFooter()}
  </div>
</div>
    `;
  }

  private generateEmptyPage(visit: VisitWithDetails): string {
    return `
<div class="page">
  <div class="card">
    <div class="card-header">
      ${this.generateHeader(visit)}
    </div>
    <div class="card-body">
      ${this.generateVisitDataSection(visit)}
      <div class="declaration-card">
        Nenhum imóvel vinculado a esta visita.
      </div>
    </div>
    <div class="signature-divider"></div>
    ${this.generateSignatures(visit)}
    ${this.generateFooter()}
  </div>
</div>
    `;
  }

  /**
   * Generates HTML for header with company logo and information.
   * Logo is displayed from URL (company_logo_url) - supports absolute URLs or base64.
   * If logo fails to load or URL is invalid, a placeholder is shown.
   */
  private generateHeader(visit: VisitWithDetails): string {
    const brokerNameRaw = visit.broker_name || 'Corretor não informado';
    const brokerName = this.escapeHtml(brokerNameRaw);
    const brokerPhone = visit.broker_phone ? this.escapeHtml(visit.broker_phone) : '';
    const brokerInitials = this.getInitials(brokerNameRaw, 'CR');

    let avatarHtml = brokerInitials;
    if (visit.company_logo_url && typeof visit.company_logo_url === 'string') {
      const url = visit.company_logo_url.trim();
      if (this.isValidLogoUrl(url)) {
        avatarHtml = `<img src="${this.escapeHtml(url)}" alt="Logo" />`;
      }
    }

    return `
<table class="header-table">
  <tr>
    <td class="header-left">
      <table class="broker-table">
        <tr>
          <td class="broker-avatar-cell">
            <div class="broker-avatar">${avatarHtml}</div>
          </td>
          <td>
            <div class="broker-name">${brokerName}</div>
            <div class="broker-role">Corretor de Imóveis</div>
            ${brokerPhone ? `<div class="broker-phone">${brokerPhone}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
    <td class="header-right">
      <div class="badge">DOCUMENTO OFICIAL</div>
      <div class="header-title">ROTEIRO DE VISITA</div>
    </td>
  </tr>
</table>
    `;
  }

  private generateVisitDataSection(visit: VisitWithDetails): string {
    const visitDate = this.formatVisitDate(visit.visit_date);
    const visitTime = visit.visit_time || '-';
    const status = this.formatStatus(visit.status);
    const statusBadge = this.getStatusBadgeHtml(status);
    const notes = visit.notes ? this.escapeHtml(visit.notes) : '';
    const notesBlock = notes
      ? `
    <div class="divider"></div>
    <div>
      <span class="field-label">Observações importantes</span>
      <div class="visit-notes">"${notes}"</div>
    </div>
      `
      : '';

    return `
<div class="section">
  <table class="section-heading-table">
    <tr>
      <td class="section-heading-icon">${this.getSectionIconSvg('visit')}</td>
      <td class="section-heading-text">Dados da Visita</td>
    </tr>
  </table>
  <div class="section-card">
    <table class="info-grid">
      <tr>
        <td>
          <span class="field-label">Data da visita</span>
          <span class="field-value">${visitDate}</span>
        </td>
        <td>
          <span class="field-label">Horário agendado</span>
          <span class="field-value">${visitTime}</span>
        </td>
        <td>
          <span class="field-label">Status do agendamento</span>
          ${statusBadge}
        </td>
      </tr>
    </table>
    ${notesBlock}
  </div>
</div>
    `;
  }

  /**
   * Generates participants section with Cliente and Corretor.
   * Note: Owner (Proprietário) information is intentionally excluded from this section
   * as per requirements - owner signature was also removed from the document.
   */
  private generateParticipantsSection(visit: VisitWithDetails): string {
    const clientNameRaw = visit.client_name || 'Cliente não informado';
    const brokerNameRaw = visit.broker_name || 'Corretor não informado';
    const clientName = this.escapeHtml(clientNameRaw);
    const brokerName = this.escapeHtml(brokerNameRaw);
    return `
<div class="section">
  <table class="section-heading-table">
    <tr>
      <td class="section-heading-icon">${this.getSectionIconSvg('participants')}</td>
      <td class="section-heading-text">Participantes</td>
    </tr>
  </table>
  <div class="section-card">
    <table class="participants-table">
      <tr>
        <td>
          <div class="participant-card">
            <table class="participant-table">
              <tr>
                <td class="participant-avatar-cell">
                  <div class="participant-avatar">${this.getInitials(clientNameRaw, 'CL')}</div>
                </td>
                <td>
                  <div class="participant-role">Cliente</div>
                  <div class="participant-name">${clientName}</div>
                </td>
              </tr>
            </table>
          </div>
        </td>
        <td>
          <div class="participant-card">
            <table class="participant-table">
              <tr>
                <td class="participant-avatar-cell">
                  <div class="participant-avatar">${this.getInitials(brokerNameRaw, 'CR')}</div>
                </td>
                <td>
                  <div class="participant-role">Corretor Responsável</div>
                  <div class="participant-name">${brokerName}</div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </div>
</div>
    `;
  }

  private generatePropertyDataSection(property: VisitProperty, propertyNumber: number): string {
    const value = property.suggested_sale_value 
      ? 'R$ ' + property.suggested_sale_value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '-';

    return `
<div class="section">
  <table class="section-heading-table">
    <tr>
      <td class="section-heading-icon">${this.getSectionIconSvg('property')}</td>
      <td class="section-heading-text">Dados do Imóvel ${propertyNumber}</td>
    </tr>
  </table>
  <div class="section-card">
    <table class="property-top">
      <tr>
        <td class="property-left">
          <span class="field-label">Referência</span>
          <span class="field-value property-reference">${this.escapeHtml(property.property_reference || '-')}</span>
        </td>
        <td class="property-right">
          <span class="field-label">Valor sugerido</span>
          <span class="field-value property-value">${value}</span>
        </td>
      </tr>
    </table>
    <div class="divider"></div>
    <div>
      <span class="field-label">Localização</span>
      <div class="address-line">${this.getLocationIconSvg()}${this.escapeHtml(property.full_address || '-')}</div>
    </div>
    ${property.development ? `
    <div class="subsection">
      <span class="field-label">Empreendimento</span>
      <span class="field-value">${this.escapeHtml(property.development)}</span>
    </div>
    ` : ''}

    <div class="divider"></div>
    <table class="metrics-grid">
      <tr>
        <td>
          <div class="metric-icon">${this.getAttributeIconSvg('bed')}</div>
          <div class="metric-value">${property.bedrooms?.toString() || '-'}</div>
          <div class="metric-label">Dormitórios</div>
        </td>
        <td>
          <div class="metric-icon">${this.getAttributeIconSvg('suite')}</div>
          <div class="metric-value">${property.suites?.toString() || '-'}</div>
          <div class="metric-label">Suítes</div>
        </td>
        <td>
          <div class="metric-icon">${this.getAttributeIconSvg('bath')}</div>
          <div class="metric-value">${property.bathrooms?.toString() || '-'}</div>
          <div class="metric-label">Banheiros</div>
        </td>
        <td>
          <div class="metric-icon">${this.getAttributeIconSvg('car')}</div>
          <div class="metric-value">${property.parking_spaces?.toString() || '-'}</div>
          <div class="metric-label">Vagas</div>
        </td>
        <td>
          <div class="metric-icon">${this.getAttributeIconSvg('area')}</div>
          <div class="metric-value">${property.total_area ? property.total_area + ' m²' : '-'}</div>
          <div class="metric-label">Área total</div>
        </td>
        <td>
          <div class="metric-icon">${this.getAttributeIconSvg('built')}</div>
          <div class="metric-value">${property.built_area ? property.built_area + ' m²' : '-'}</div>
          <div class="metric-label">Construída</div>
        </td>
      </tr>
    </table>
  </div>
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
  <table class="section-heading-table">
    <tr>
      <td class="section-heading-icon">${this.getSectionIconSvg('evaluation')}</td>
      <td class="section-heading-text">Avaliação do Imóvel</td>
    </tr>
  </table>
  <div class="section-card">
    ${this.generateRatingHtml('Estado de conservação', evaluation.conservation_state)}
    ${this.generateRatingHtml('Localização', evaluation.location_rating)}
    ${this.generateRatingHtml('Valor do imóvel', evaluation.property_value_rating)}
    ${this.generateCheckboxesHtml('Interesse do cliente', evaluation.interest_level)}
  </div>
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

  private getStatusBadgeHtml(label: string): string {
    const safeLabel = this.escapeHtml(label || '-');
    return `<span class="status-badge"><span class="status-icon">${this.getStatusCheckIconSvg()}</span>${safeLabel}</span>`;
  }

  private getInitials(name: string, fallback: string): string {
    if (!name) {
      return fallback;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return fallback;
    }

    const parts = trimmed.split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map(part => part[0]).join('');
    return (initials || fallback).toUpperCase();
  }

  private getLocationIconSvg(): string {
    return `
<span class="icon">
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"></path>
    <circle cx="12" cy="11" r="2"></circle>
  </svg>
</span>`;
  }

  private getStatusCheckIconSvg(): string {
    return `<svg viewBox="0 0 20 20" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l3 3 7-7"></path></svg>`;
  }

  private getSectionIconSvg(type: 'visit' | 'participants' | 'property' | 'evaluation'): string {
    if (type === 'visit') {
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 2v4M16 2v4M3 10h18"></path></svg>`;
    }
    if (type === 'participants') {
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"></circle><path d="M4 20a5 5 0 0 1 10 0"></path><circle cx="17" cy="9" r="2"></circle><path d="M14 20a4 4 0 0 1 7 0"></path></svg>`;
    }
    if (type === 'evaluation') {
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.7 5.5L21 8l-4.5 4.2L17.6 20 12 16.8 6.4 20l1.1-7.8L3 8l6.3-.5z"></path></svg>`;
    }
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l8-6 8 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M9 22v-6h6v6"></path></svg>`;
  }

  private getAttributeIconSvg(type: 'bed' | 'suite' | 'bath' | 'car' | 'area' | 'built'): string {
    if (type === 'bed') {
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18v8H3z"></path><path d="M7 10V7h10v3"></path></svg>`;
    }
    if (type === 'suite') {
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path></svg>`;
    }
    if (type === 'bath') {
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"></path><path d="M7 10V6a2 2 0 0 1 2-2h2"></path></svg>`;
    }
    if (type === 'car') {
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-5h14l2 5"></path><rect x="4" y="12" width="16" height="6" rx="2"></rect><circle cx="8" cy="18" r="1.5"></circle><circle cx="16" cy="18" r="1.5"></circle></svg>`;
    }
    if (type === 'area') {
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M4 12h16M12 4v16"></path></svg>`;
    }
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l8-6 8 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M9 22v-6h6v6"></path></svg>`;
  }

  private generateDeclaration(): string {
    return `
<div class="declaration-card">
  Na qualidade de possível comprador, declaro para os devidos fins que visitei o imóvel acima descrito por intermédio da imobiliária, estando ciente das condições apresentadas.
</div>
    `;
  }

  /**
   * Generates signature section with only Cliente and Corretor.
   * Proprietário signature removed as per requirements.
   */
  private generateSignatures(visit: VisitWithDetails): string {
    const clientName = this.escapeHtml(visit.client_name || '');
    const brokerName = this.escapeHtml(visit.broker_name || '');
    return `
<table class="signatures-table">
  <tr>
    <td style="width: 50%;">
      <div class="signature-block">
        <div class="signature-line">Assinatura do Cliente</div>
        <div class="signature-name">${clientName || '&nbsp;'}</div>
      </div>
    </td>
    <td style="width: 50%;">
      <div class="signature-block">
        <div class="signature-line">Assinatura do Corretor</div>
        <div class="signature-name">${brokerName || '&nbsp;'}</div>
      </div>
    </td>
  </tr>
</table>
    `;
  }

  private formatVisitDate(value?: string | null): string {
    const parsed = this.parseVisitDateLocal(value);
    if (!parsed) return '-';
    return parsed.toLocaleDateString('pt-BR');
  }

  private parseVisitDateLocal(value?: string | null): Date | null {
    if (!value) return null;
    const parts = value.split('-').map(part => Number(part));
    if (parts.length !== 3 || parts.some(part => Number.isNaN(part))) return null;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }

  private generateFooter(): string {
    const timestamp = new Date().toLocaleString('pt-BR');
    return `
<table class="footer">
  <tr>
    <td class="footer-left">Gerado pelo Sistema Integrado</td>
    <td class="footer-right">Data de geração: ${timestamp}</td>
  </tr>
</table>
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

