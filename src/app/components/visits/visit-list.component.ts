import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VisitService } from '../../services/visit.service';
import { Visit } from '../../models/visit.model';
import { VisitCalendarComponent } from './visit-calendar.component';
import { VisitStatisticsComponent } from './visit-statistics.component';
import { VisitPdfService } from '../../services/visit-pdf.service';
import { VisitFormComponent } from './visit-form.component';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VisitCalendarComponent, VisitStatisticsComponent, VisitFormComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Visitas Agendadas</h1>
        <button (click)="openForm()" class="btn-primary">
          + Nova Visita
        </button>
      </div>

      <div class="content-wrapper">
        <!-- Statistics Section -->
        <app-visit-statistics
          [visits]="visits"
          [filterView]="currentView"
          [currentDate]="currentDate">
        </app-visit-statistics>

        <!-- Calendar Section -->
        <app-visit-calendar
          #calendar
          [visits]="visits"
          (viewChange)="onViewChange($event)"
          (dateChange)="onDateChange($event)">
        </app-visit-calendar>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let visit of visits">
              <td>{{ visit.visit_date | date:'dd/MM/yyyy' }}</td>
              <td>{{ visit.visit_time }}</td>
              <td><span class="badge" [class]="'badge-' + visit.status">{{ visit.status || 'agendada' }}</span></td>
              <td>{{ visit.notes || '-' }}</td>
              <td>
                <button (click)="editVisit(visit)" class="btn-sm">Editar</button>
                <button (click)="deleteVisit(visit.id)" class="btn-sm btn-danger">Excluir</button>
                <button (click)="generatePdf(visit.id)" class="btn-sm btn-success">Gerar PDF</button>
              </td>
            </tr>
            <tr *ngIf="visits.length === 0">
              <td colspan="5" class="text-center">Nenhuma visita agendada</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      <!-- Visit Form Modal -->
      <app-visit-form
        [isVisible]="showForm"
        [editingVisit]="editingVisit"
        (onClose)="closeForm()"
        (onSave)="onFormSave()">
      </app-visit-form>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .page-header {
      background: white;
      padding: 2rem 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border-bottom: 1px solid #e5e7eb;
    }

    .page-header h1 {
      margin: 0;
      color: #1e293b;
      font-size: 2rem;
      font-weight: 700;
    }

    .content-wrapper {
      margin: 2rem 2.5rem;
    }

    .btn-primary {
      padding: 0.875rem 1.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .table-card {
      background: white;
      margin-bottom: 2rem;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f8f9fa;
      padding: 1rem 1.25rem;
      text-align: left;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
    }

    .data-table td {
      padding: 1.25rem;
      border-bottom: 1px solid #e5e7eb;
      color: #475569;
    }

    .data-table tbody tr {
      transition: background 0.2s ease;
    }

    .data-table tbody tr:hover {
      background: #f8f9fa;
    }

    .badge {
      padding: 0.35rem 0.85rem;
      color: white;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: inline-block;
    }

    .badge-agendada { background: #06b6d4; }
    .badge-confirmada { background: #10b981; }
    .badge-realizada { background: #64748b; }
    .badge-cancelada { background: #ef4444; }

    .btn-sm {
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      background: #64748b;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-sm:hover {
      background: #475569;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #ef4444;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-success {
      background: #10b981;
    }

    .btn-success:hover {
      background: #059669;
    }

    .text-center {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .page-header, .content-wrapper {
        margin: 1rem;
        padding: 1.5rem;
      }

      .table-card {
        padding: 1.5rem;
      }

      .data-table {
        font-size: 0.85rem;
      }
    }
  `]
})
export class VisitListComponent implements OnInit {
  visits: Visit[] = [];
  showForm = false;
  editingVisit: Visit | null = null;
  currentView: 'day' | 'week' | 'month' = 'month';
  currentDate: Date = new Date();

  constructor(
    private visitService: VisitService,
    private pdfService: VisitPdfService
  ) {}

  async ngOnInit() {
    await this.loadVisits();
  }

  async loadVisits() {
    try {
      this.visits = await this.visitService.getAll();
    } catch (error) {
      console.error('Error loading visits:', error);
    }
  }

  openForm() {
    this.editingVisit = null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingVisit = null;
  }

  editVisit(visit: Visit) {
    this.editingVisit = visit;
    this.showForm = true;
  }

  async onFormSave() {
    await this.loadVisits();
  }

  async deleteVisit(id: string) {
    if (confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        await this.visitService.delete(id);
        await this.loadVisits();
      } catch (error) {
        console.error('Error deleting visit:', error);
      }
    }
  }

  onViewChange(view: 'day' | 'week' | 'month') {
    this.currentView = view;
  }

  onDateChange(date: Date) {
    this.currentDate = date;
  }

  async generatePdf(visitId: string) {
    try {
      const visitWithDetails = await this.visitService.getVisitWithDetails(visitId);
      if (visitWithDetails) {
        this.pdfService.generateVisitPdf(visitWithDetails);
      } else {
        console.error('Visit not found');
        alert('Erro ao carregar dados da visita.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  }
}
