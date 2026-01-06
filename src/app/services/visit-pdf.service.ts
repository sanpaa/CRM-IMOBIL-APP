import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VisitWithDetails } from '../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitPdfService {

  constructor() {}

  generateVisitPdf(visit: VisitWithDetails): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Roteiro de Visita', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Visit Info Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações da Visita', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const visitDate = visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('pt-BR') : '-';
    const visitInfo = [
      `Data: ${visitDate}`,
      `Horário: ${visit.visit_time || '-'}`,
      `Status: ${this.formatStatus(visit.status)}`,
    ];

    visitInfo.forEach(info => {
      doc.text(info, 14, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // People Info Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Participantes', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const peopleInfo = [
      `Cliente: ${visit.client_name || '-'}`,
      `Corretor: ${visit.broker_name || '-'}`,
      `Proprietário: ${visit.owner_name || '-'}`,
    ];

    peopleInfo.forEach(info => {
      doc.text(info, 14, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Notes Section
    if (visit.notes) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações Gerais', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(visit.notes, 180);
      doc.text(splitNotes, 14, yPosition);
      yPosition += (splitNotes.length * 6) + 10;
    }

    // Properties Section
    if (visit.properties && visit.properties.length > 0) {
      visit.properties.forEach((property, index) => {
        // Add new page for each property after the first
        if (index > 0) {
          doc.addPage();
          yPosition = 20;
        }

        // Check if we need a new page
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Imóvel ${index + 1}`, 14, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Property details
        const propertyDetails = [
          ['Referência:', property.property_reference || '-'],
          ['Endereço:', property.full_address || '-'],
          ['Empreendimento:', property.development || '-'],
          ['Dormitórios:', property.bedrooms?.toString() || '-'],
          ['Suítes:', property.suites?.toString() || '-'],
          ['Banheiros:', property.bathrooms?.toString() || '-'],
          ['Vagas:', property.parking_spaces?.toString() || '-'],
          ['Área Total:', property.total_area ? `${property.total_area} m²` : '-'],
          ['Área Construída:', property.built_area ? `${property.built_area} m²` : '-'],
          ['Valor Sugerido:', property.suggested_sale_value ? 
            `R$ ${property.suggested_sale_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [],
          body: propertyDetails,
          theme: 'plain',
          styles: {
            fontSize: 10,
            cellPadding: 2,
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 'auto' }
          },
          margin: { left: 14 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;

        // Find evaluation for this property
        const evaluation = visit.evaluations?.find(e => e.property_id === property.id);
        
        if (evaluation && visit.status === 'realizada') {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Avaliação do Cliente', 14, yPosition);
          yPosition += 7;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');

          const evaluationDetails = [
            ['Estado de Conservação:', this.formatRating(evaluation.conservation_state)],
            ['Localização:', this.formatRating(evaluation.location_rating)],
            ['Valor do Imóvel:', this.formatRating(evaluation.property_value_rating)],
            ['Nível de Interesse:', this.formatInterestLevel(evaluation.interest_level)],
          ];

          autoTable(doc, {
            startY: yPosition,
            head: [],
            body: evaluationDetails,
            theme: 'plain',
            styles: {
              fontSize: 10,
              cellPadding: 2,
            },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 50 },
              1: { cellWidth: 'auto' }
            },
            margin: { left: 14 }
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }
      });
    } else {
      doc.text('Nenhum imóvel vinculado a esta visita.', 14, yPosition);
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
      doc.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `roteiro-visita-${visit.visit_date || 'sem-data'}.pdf`;
    doc.save(fileName);
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

  private formatRating(rating?: number): string {
    if (!rating) return '-';
    return `${rating} de 5 estrelas`;
  }

  private formatInterestLevel(level?: string): string {
    const levelMap: { [key: string]: string } = {
      'DESCARTOU': 'Descartou',
      'INTERESSOU': 'Interessou',
      'INTERESSOU_E_ASSINOU_PROPOSTA': 'Interessou e Assinou Proposta'
    };
    return levelMap[level || ''] || level || '-';
  }
}
