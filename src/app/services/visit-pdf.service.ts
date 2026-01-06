import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { VisitWithDetails } from '../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitPdfService {

  constructor() {}

  generateVisitPdf(visit: VisitWithDetails): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    if (visit.properties && visit.properties.length > 0) {
      visit.properties.forEach((property, index) => {
        if (index > 0) {
          doc.addPage();
        }
        this.drawPropertyPage(doc, visit, property, index + 1);
      });
    } else {
      this.drawEmptyPage(doc, visit);
    }

    // Save the PDF
    const fileName = `roteiro-visita-${visit.visit_date || 'sem-data'}.pdf`;
    doc.save(fileName);
  }

  private drawPropertyPage(doc: jsPDF, visit: VisitWithDetails, property: any, propertyNumber: number): void {
    const pageWidth = 210;
    const margin = 15;
    let y = margin;

    // Draw Header
    y = this.drawHeader(doc, visit, y, margin, pageWidth);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ROTEIRO DE VISITA', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Visit Data Section
    y = this.drawSection(doc, 'Dados da Visita', y, margin, pageWidth, () => {
      const visitDate = visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('pt-BR') : '-';
      const visitTime = visit.visit_time || '-';
      const status = this.formatStatus(visit.status);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const col1 = margin + 4;
      const col2 = margin + 70;
      const col3 = margin + 140;
      let rowY = y + 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data:', col1, rowY);
      doc.text('Horário:', col2, rowY);
      doc.text('Status:', col3, rowY);
      
      doc.setFont('helvetica', 'normal');
      rowY += 5;
      doc.text(visitDate, col1, rowY);
      doc.text(visitTime, col2, rowY);
      doc.text(status, col3, rowY);
      
      return rowY + 3;
    });

    // Participants Section
    y = this.drawSection(doc, 'Participantes', y, margin, pageWidth, () => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let rowY = y + 5;
      const col1 = margin + 4;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Cliente:', col1, rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(visit.client_name || '-', col1 + 20, rowY);
      
      rowY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Corretor:', col1, rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(visit.broker_name || '-', col1 + 20, rowY);
      
      rowY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Proprietário:', col1, rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(visit.owner_name || '-', col1 + 25, rowY);
      
      return rowY + 3;
    });

    // Property Data Section
    y = this.drawSection(doc, `Dados do Imóvel ${propertyNumber}`, y, margin, pageWidth, () => {
      doc.setFontSize(10);
      let rowY = y + 5;
      const col1 = margin + 4;
      
      const propertyData = [
        ['Referência:', property.property_reference || '-'],
        ['Endereço:', property.full_address || '-'],
        ...(property.development ? [['Empreendimento:', property.development]] : []),
      ];

      propertyData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, col1, rowY);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(value, pageWidth - margin - col1 - 30);
        doc.text(textLines, col1 + 30, rowY);
        rowY += textLines.length * 5;
      });

      // Property specs in columns
      const specs = [
        ['Dormitórios:', property.bedrooms?.toString() || '-'],
        ['Suítes:', property.suites?.toString() || '-'],
        ['Banheiros:', property.bathrooms?.toString() || '-'],
      ];
      
      const specs2 = [
        ['Vagas:', property.parking_spaces?.toString() || '-'],
        ['Área Total:', property.total_area ? property.total_area + ' m²' : '-'],
        ['Área Construída:', property.built_area ? property.built_area + ' m²' : '-'],
      ];

      rowY += 2;
      const colSpec1 = col1;
      const colSpec2 = margin + 70;
      const colSpec3 = margin + 135;
      
      let maxY = rowY;
      
      // First row of specs
      [specs[0], specs[1], specs[2]].forEach((spec, idx) => {
        const xPos = [colSpec1, colSpec2, colSpec3][idx];
        doc.setFont('helvetica', 'bold');
        doc.text(spec[0], xPos, rowY);
        doc.setFont('helvetica', 'normal');
        doc.text(spec[1], xPos + 25, rowY);
      });
      
      rowY += 5;
      
      // Second row of specs
      [specs2[0], specs2[1], specs2[2]].forEach((spec, idx) => {
        const xPos = [colSpec1, colSpec2, colSpec3][idx];
        doc.setFont('helvetica', 'bold');
        doc.text(spec[0], xPos, rowY);
        doc.setFont('helvetica', 'normal');
        const labelWidth = idx === 1 ? 22 : (idx === 2 ? 30 : 15);
        doc.text(spec[1], xPos + labelWidth, rowY);
      });
      
      rowY += 5;
      
      // Value
      doc.setFont('helvetica', 'bold');
      doc.text('Valor Sugerido:', col1, rowY);
      doc.setFont('helvetica', 'normal');
      const value = property.suggested_sale_value ? 
        'R$ ' + property.suggested_sale_value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
      doc.text(value, col1 + 32, rowY);
      
      return rowY + 3;
    });

    // Evaluation Section (if exists and visit is completed)
    const evaluation = visit.evaluations?.find(e => e.property_id === property.id);
    if (evaluation && visit.status === 'realizada') {
      y = this.drawSection(doc, 'Avaliação do Imóvel', y, margin, pageWidth, () => {
        doc.setFontSize(10);
        let rowY = y + 5;
        const col1 = margin + 4;
        
        // Conservation state
        doc.setFont('helvetica', 'bold');
        doc.text('Estado de conservação:', col1, rowY);
        rowY += 5;
        this.drawRating(doc, col1 + 5, rowY, evaluation.conservation_state);
        rowY += 8;
        
        // Location
        doc.setFont('helvetica', 'bold');
        doc.text('Localização:', col1, rowY);
        rowY += 5;
        this.drawRating(doc, col1 + 5, rowY, evaluation.location_rating);
        rowY += 8;
        
        // Property value
        doc.setFont('helvetica', 'bold');
        doc.text('Valor do imóvel:', col1, rowY);
        rowY += 5;
        this.drawRating(doc, col1 + 5, rowY, evaluation.property_value_rating);
        rowY += 8;
        
        // Interest level
        doc.setFont('helvetica', 'bold');
        doc.text('Interesse do cliente:', col1, rowY);
        rowY += 5;
        this.drawInterestCheckboxes(doc, col1 + 5, rowY, evaluation.interest_level);
        
        return rowY + 3;
      });
    }

    // Declaration text
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const declarationText = 'Na qualidade de possível comprador, declaro para os devidos fins que visitei o imóvel acima descrito por intermédio da imobiliária, estando ciente das condições apresentadas.';
    const lines = doc.splitTextToSize(declarationText, pageWidth - 2 * margin);
    doc.text(lines, margin, y, { align: 'justify' });
    y += lines.length * 5 + 5;

    // Signature lines
    y += 10;
    const sigWidth = (pageWidth - 2 * margin - 20) / 3;
    const sig1X = margin;
    const sig2X = margin + sigWidth + 10;
    const sig3X = margin + 2 * sigWidth + 20;
    
    // Draw signature lines
    doc.line(sig1X, y, sig1X + sigWidth, y);
    doc.line(sig2X, y, sig2X + sigWidth, y);
    doc.line(sig3X, y, sig3X + sigWidth, y);
    
    // Labels
    doc.setFontSize(9);
    doc.text('Assinatura do Cliente', sig1X + sigWidth / 2, y + 5, { align: 'center' });
    doc.text('Assinatura do Corretor', sig2X + sigWidth / 2, y + 5, { align: 'center' });
    doc.text('Assinatura do Proprietário', sig3X + sigWidth / 2, y + 5, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const timestamp = `Gerado em ${new Date().toLocaleString('pt-BR')}`;
    doc.text(timestamp, pageWidth / 2, 287, { align: 'center' });
  }

  private drawEmptyPage(doc: jsPDF, visit: VisitWithDetails): void {
    const pageWidth = 210;
    const margin = 15;
    let y = margin;

    y = this.drawHeader(doc, visit, y, margin, pageWidth);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ROTEIRO DE VISITA', pageWidth / 2, y, { align: 'center' });
    y += 15;

    y = this.drawSection(doc, 'Dados da Visita', y, margin, pageWidth, () => {
      const visitDate = visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('pt-BR') : '-';
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let rowY = y + 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Data:', margin + 4, rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(visitDate, margin + 20, rowY);
      
      return rowY + 3;
    });

    y += 20;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Nenhum imóvel vinculado a esta visita.', pageWidth / 2, y, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 287, { align: 'center' });
  }

  private drawHeader(doc: jsPDF, visit: VisitWithDetails, y: number, margin: number, pageWidth: number): number {
    const headerHeight = 25;
    
    // Draw border
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    doc.line(margin, y + headerHeight, pageWidth - margin, y + headerHeight);
    
    // Company info (left side)
    const logoSize = 18;
    const logoX = margin + 2;
    const logoY = y + 3;
    
    // Draw logo placeholder box
    doc.setLineWidth(0.3);
    doc.rect(logoX, logoY, logoSize, logoSize);
    doc.setFontSize(8);
    doc.text('LOGO', logoX + logoSize / 2, logoY + logoSize / 2 + 2, { align: 'center' });
    
    // Company details
    const infoX = logoX + logoSize + 4;
    let infoY = logoY + 4;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(visit.company_name || 'Imobiliária', infoX, infoY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (visit.company_address) {
      infoY += 4;
      const addressLines = doc.splitTextToSize(visit.company_address, 70);
      doc.text(addressLines[0], infoX, infoY);
      if (addressLines.length > 1) {
        infoY += 3.5;
        doc.text(addressLines[1], infoX, infoY);
      }
    }
    if (visit.company_phone) {
      infoY += 4;
      doc.text(`Tel: ${visit.company_phone}`, infoX, infoY);
    }
    if (visit.company_creci) {
      infoY += 4;
      doc.text(`CRECI: ${visit.company_creci}`, infoX, infoY);
    }
    
    // Broker info (right side)
    if (visit.broker_name) {
      let brokerY = logoY + 4;
      const brokerX = pageWidth - margin - 60;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Corretor Responsável', brokerX, brokerY, { align: 'left' });
      
      brokerY += 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(visit.broker_name, brokerX, brokerY, { align: 'left' });
      
      if (visit.broker_creci) {
        brokerY += 4;
        doc.text(`CRECI: ${visit.broker_creci}`, brokerX, brokerY, { align: 'left' });
      }
      if (visit.broker_phone) {
        brokerY += 4;
        doc.text(`Tel: ${visit.broker_phone}`, brokerX, brokerY, { align: 'left' });
      }
    }
    
    return y + headerHeight + 5;
  }

  private drawSection(doc: jsPDF, title: string, y: number, margin: number, pageWidth: number, contentDrawer: () => number): number {
    const sectionWidth = pageWidth - 2 * margin;
    
    // Section border
    doc.setLineWidth(0.3);
    doc.rect(margin, y, sectionWidth, 7);
    
    // Section title with gray background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, sectionWidth, 7, 'F');
    doc.rect(margin, y, sectionWidth, 7, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, y + 5);
    
    y += 7;
    
    // Content area
    const contentStartY = y;
    const contentEndY = contentDrawer();
    const contentHeight = contentEndY - contentStartY;
    
    // Draw content border
    doc.setLineWidth(0.3);
    doc.line(margin, contentStartY, margin, contentEndY);
    doc.line(pageWidth - margin, contentStartY, pageWidth - margin, contentEndY);
    doc.line(margin, contentEndY, pageWidth - margin, contentEndY);
    
    return contentEndY + 5;
  }

  private drawRating(doc: jsPDF, x: number, y: number, rating?: number): void {
    const boxSize = 6;
    const gap = 3;
    
    for (let i = 1; i <= 5; i++) {
      const boxX = x + (i - 1) * (boxSize + gap);
      
      doc.setLineWidth(0.3);
      doc.rect(boxX, y, boxSize, boxSize);
      
      if (rating && i <= rating) {
        doc.setFillColor(0, 0, 0);
        doc.rect(boxX, y, boxSize, boxSize, 'F');
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(0, 0, 0);
      }
      
      doc.setFontSize(8);
      doc.text(i.toString(), boxX + boxSize / 2, y + boxSize / 2 + 1.5, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
  }

  private drawInterestCheckboxes(doc: jsPDF, x: number, y: number, interestLevel?: string): void {
    const options = [
      { label: 'Descartou', value: 'DESCARTOU' },
      { label: 'Interessou', value: 'INTERESSOU' },
      { label: 'Interessou e assinou proposta', value: 'INTERESSOU_E_ASSINOU_PROPOSTA' }
    ];
    
    const boxSize = 4;
    let currentX = x;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    options.forEach((option, index) => {
      // Draw checkbox
      doc.setLineWidth(0.3);
      doc.rect(currentX, y - boxSize / 2, boxSize, boxSize);
      
      // Check if selected
      if (interestLevel === option.value) {
        doc.setFontSize(10);
        doc.text('✓', currentX + boxSize / 2, y + 1, { align: 'center' });
        doc.setFontSize(9);
      }
      
      // Label
      doc.text(option.label, currentX + boxSize + 2, y + 1);
      
      // Move to next position
      const labelWidth = doc.getTextWidth(option.label);
      currentX += boxSize + labelWidth + 10;
      
      // Break to new line if needed
      if (index === 1 && options.length === 3) {
        y += 6;
        currentX = x;
      }
    });
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

