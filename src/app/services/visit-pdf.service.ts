import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { VisitWithDetails } from '../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitPdfService {

  constructor() {}

  generateVisitPdf(visit: VisitWithDetails): void {
    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.innerHTML = this.generateHtmlContent(visit);
    document.body.appendChild(container);

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Use html method to convert HTML to PDF
    doc.html(container, {
      callback: (pdf) => {
        // Clean up
        document.body.removeChild(container);
        
        // Save the PDF
        const fileName = `roteiro-visita-${visit.visit_date || 'sem-data'}.pdf`;
        pdf.save(fileName);
      },
      x: 0,
      y: 0,
      width: 210, // A4 width in mm
      windowWidth: 794, // A4 width in pixels at 96 DPI
      margin: [0, 0, 0, 0]
    });
  }

  private generateHtmlContent(visit: VisitWithDetails): string {
    const visitDate = visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('pt-BR') : '-';
    const currentDateTime = new Date().toLocaleString('pt-BR');
    
    // Generate property pages
    const propertyPages = (visit.properties || []).map((property, index) => {
      const evaluation = visit.evaluations?.find(e => e.property_id === property.id);
      return this.generatePropertyPage(property, evaluation, index + 1, visit, visitDate, currentDateTime);
    }).join('');

    const content = propertyPages || this.generateEmptyPage(visit, visitDate, currentDateTime);

    return `
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 0;
        color: #000;
      }

      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        box-sizing: border-box;
        background: white;
      }

      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
        margin-bottom: 10px;
      }

      .header-left {
        display: flex;
        gap: 10px;
      }

      .logo {
        width: 60px;
        height: 60px;
        border: 1px solid #000;
        text-align: center;
        font-weight: bold;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .header-info {
        font-size: 11px;
        line-height: 1.4;
      }

      .header-right {
        text-align: right;
        font-size: 11px;
        line-height: 1.4;
      }

      h1 {
        font-size: 16px;
        margin: 10px 0;
        text-transform: uppercase;
        text-align: center;
      }

      .section {
        border: 1px solid #000;
        margin-bottom: 10px;
      }

      .section-title {
        background: #f0f0f0;
        padding: 4px 6px;
        font-weight: bold;
        border-bottom: 1px solid #000;
        font-size: 11px;
      }

      .section-content {
        padding: 6px;
      }

      .row {
        display: flex;
        gap: 10px;
        margin-bottom: 6px;
      }

      .col {
        flex: 1;
        font-size: 11px;
      }

      .label {
        font-weight: bold;
      }

      .checkbox-group {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .checkbox {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
      }

      .rating {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      .rating span {
        border: 1px solid #000;
        padding: 2px 6px;
        font-size: 10px;
        min-width: 20px;
        text-align: center;
      }

      .rating .star-filled {
        background: #000;
        color: #fff;
      }

      .signature {
        height: 40px;
        border-top: 1px solid #000;
        margin-top: 30px;
        text-align: center;
        padding-top: 4px;
        font-size: 11px;
      }

      .footer-text {
        font-size: 10px;
        margin-top: 15px;
        margin-bottom: 10px;
        text-align: justify;
        line-height: 1.4;
      }

      .page-break {
        page-break-before: always;
      }
    </style>
    ${content}
    `;
  }

  private generatePropertyPage(
    property: any,
    evaluation: any,
    propertyNumber: number,
    visit: VisitWithDetails,
    visitDate: string,
    currentDateTime: string
  ): string {
    const visitTime = visit.visit_time || '-';
    const status = this.formatStatus(visit.status);
    
    return `
    <div class="page${propertyNumber > 1 ? ' page-break' : ''}">
      ${this.generateHeader(visit)}
      
      <h1>Roteiro de Visita</h1>

      <!-- DADOS DA VISITA -->
      <div class="section">
        <div class="section-title">Dados da Visita</div>
        <div class="section-content">
          <div class="row">
            <div class="col"><span class="label">Data:</span> ${visitDate}</div>
            <div class="col"><span class="label">Horário:</span> ${visitTime}</div>
            <div class="col"><span class="label">Status:</span> ${status}</div>
          </div>
        </div>
      </div>

      <!-- PARTICIPANTES -->
      <div class="section">
        <div class="section-title">Participantes</div>
        <div class="section-content">
          <div class="row">
            <div class="col"><span class="label">Cliente:</span> ${visit.client_name || '-'}</div>
          </div>
          <div class="row">
            <div class="col"><span class="label">Corretor:</span> ${visit.broker_name || '-'}</div>
          </div>
          <div class="row">
            <div class="col"><span class="label">Proprietário:</span> ${visit.owner_name || '-'}</div>
          </div>
        </div>
      </div>

      <!-- IMÓVEL -->
      <div class="section">
        <div class="section-title">Dados do Imóvel ${propertyNumber}</div>
        <div class="section-content">
          <div class="row">
            <div class="col"><span class="label">Referência:</span> ${property.property_reference || '-'}</div>
          </div>
          <div class="row">
            <div class="col"><span class="label">Endereço:</span> ${property.full_address || '-'}</div>
          </div>
          ${property.development ? `<div class="row"><div class="col"><span class="label">Empreendimento:</span> ${property.development}</div></div>` : ''}
          
          <div class="row">
            <div class="col"><span class="label">Dormitórios:</span> ${property.bedrooms || '-'}</div>
            <div class="col"><span class="label">Suítes:</span> ${property.suites || '-'}</div>
            <div class="col"><span class="label">Banheiros:</span> ${property.bathrooms || '-'}</div>
          </div>
          
          <div class="row">
            <div class="col"><span class="label">Vagas:</span> ${property.parking_spaces || '-'}</div>
            <div class="col"><span class="label">Área Total:</span> ${property.total_area ? property.total_area + ' m²' : '-'}</div>
            <div class="col"><span class="label">Área Construída:</span> ${property.built_area ? property.built_area + ' m²' : '-'}</div>
          </div>
          
          <div class="row">
            <div class="col"><span class="label">Valor Sugerido:</span> ${property.suggested_sale_value ? 'R$ ' + property.suggested_sale_value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</div>
          </div>
        </div>
      </div>

      ${evaluation && visit.status === 'realizada' ? this.generateEvaluationSection(evaluation) : ''}

      <!-- DECLARAÇÃO -->
      <div class="footer-text">
        Na qualidade de possível comprador, declaro para os devidos fins
        que visitei o imóvel acima descrito por intermédio da imobiliária,
        estando ciente das condições apresentadas.
      </div>

      <!-- ASSINATURAS -->
      <div class="row">
        <div class="col signature">Assinatura do Cliente</div>
        <div class="col signature">Assinatura do Corretor</div>
        <div class="col signature">Assinatura do Proprietário</div>
      </div>

      <div style="text-align: center; font-size: 10px; margin-top: 10px;">
        Gerado em ${currentDateTime}
      </div>
    </div>
    `;
  }

  private generateHeader(visit: VisitWithDetails): string {
    const companyName = visit.company_name || 'Imobiliária';
    const companyAddress = visit.company_address || '';
    const companyPhone = visit.company_phone || '';
    const companyCreci = visit.company_creci || '';
    const companyLogo = visit.company_logo_url || '';
    
    const brokerName = visit.broker_name || '';
    const brokerCreci = visit.broker_creci || '';
    const brokerPhone = visit.broker_phone || '';

    return `
    <div class="header">
      <div class="header-left">
        <div class="logo">${companyLogo ? `<img src="${companyLogo}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : 'LOGO'}</div>
        <div class="header-info">
          <strong>${companyName}</strong><br>
          ${companyAddress ? companyAddress + '<br>' : ''}
          ${companyPhone ? 'Tel: ' + companyPhone + '<br>' : ''}
          ${companyCreci ? 'CRECI: ' + companyCreci : ''}
        </div>
      </div>

      <div class="header-right">
        ${brokerName ? '<strong>Corretor Responsável</strong><br>' + brokerName + '<br>' : ''}
        ${brokerCreci ? 'CRECI: ' + brokerCreci + '<br>' : ''}
        ${brokerPhone ? 'Tel: ' + brokerPhone : ''}
      </div>
    </div>
    `;
  }

  private generateEvaluationSection(evaluation: any): string {
    return `
    <div class="section">
      <div class="section-title">Avaliação do Imóvel</div>
      <div class="section-content">
        <div class="row">
          <div class="col">
            <span class="label">Estado de conservação:</span>
            <div class="rating">
              ${this.generateRatingStars(evaluation.conservation_state)}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <span class="label">Localização:</span>
            <div class="rating">
              ${this.generateRatingStars(evaluation.location_rating)}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <span class="label">Valor do imóvel:</span>
            <div class="rating">
              ${this.generateRatingStars(evaluation.property_value_rating)}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <span class="label">Interesse do cliente:</span>
            <div class="checkbox-group">
              <div class="checkbox">${evaluation.interest_level === 'DESCARTOU' ? '☑' : '☐'} Descartou</div>
              <div class="checkbox">${evaluation.interest_level === 'INTERESSOU' ? '☑' : '☐'} Interessou</div>
              <div class="checkbox">${evaluation.interest_level === 'INTERESSOU_E_ASSINOU_PROPOSTA' ? '☑' : '☐'} Interessou e assinou proposta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  private generateRatingStars(rating?: number): string {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = rating && i <= rating;
      stars.push(`<span class="${filled ? 'star-filled' : ''}">${i}</span>`);
    }
    return stars.join('');
  }

  private generateEmptyPage(visit: VisitWithDetails, visitDate: string, currentDateTime: string): string {
    return `
    <div class="page">
      ${this.generateHeader(visit)}
      <h1>Roteiro de Visita</h1>
      <div class="section">
        <div class="section-title">Dados da Visita</div>
        <div class="section-content">
          <div class="row">
            <div class="col"><span class="label">Data:</span> ${visitDate}</div>
            <div class="col"><span class="label">Horário:</span> ${visit.visit_time || '-'}</div>
            <div class="col"><span class="label">Status:</span> ${this.formatStatus(visit.status)}</div>
          </div>
        </div>
      </div>
      <p style="text-align: center; margin-top: 40px; color: #666;">Nenhum imóvel vinculado a esta visita.</p>
      <div style="text-align: center; font-size: 10px; margin-top: 20px;">Gerado em ${currentDateTime}</div>
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
}

