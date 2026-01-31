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
import { PopupService } from '../../shared/services/popup.service';
import { GoogleCalendarService } from 'src/app/services/google-calendar.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VisitCalendarComponent, VisitStatisticsComponent, VisitFormComponent, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header title="Agenda de Visitas">
        <button header-actions (click)="openForm()" class="btn-primary">
          <i class="bi bi-plus-lg"></i>
          Nova Visita
        </button>
      </app-page-header>

      <div class="content-wrapper">
        <!-- Statistics Section -->
        <app-visit-statistics
          [visits]="visibleVisits"
          [filterView]="currentView"
          [currentDate]="currentDate">
        </app-visit-statistics>

        <!-- Calendar Section -->
        <app-visit-calendar
          #calendar
          [visits]="visibleVisits"
          [searchTerm]="searchTerm"
          [statusFilter]="statusFilter"
          (searchChange)="onSearchChange($event)"
          (statusChange)="onStatusFilterChange($event)"
          (viewChange)="onViewChange($event)"
          (dateChange)="onDateChange($event)">
        </app-visit-calendar>

        <div class="table-card">
          <div class="table-header">
            <div>
              <h3>Detalhes das visitas de hoje</h3>
              <p>Resumo das visitas no período selecionado</p>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Imóvel / Cliente</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let visit of filteredVisits">
                <td>{{ formatVisitDate(visit.visit_date) }}</td>
                <td>{{ visit.visit_time }}</td>
                <td>
                  <div class="visit-main">{{ visit.notes || 'Visita agendada' }}</div>
                  <div class="visit-sub">ID: {{ visit.property_id || '-' }}</div>
                </td>
                <td><span class="badge" [class]="'badge-' + visit.status">{{ visit.status || 'agendada' }}</span></td>
                <td>
                  <button (click)="editVisit(visit)" class="btn-icon" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button (click)="deleteVisit(visit)" class="btn-icon danger" title="Excluir"><i class="bi bi-trash"></i></button>
                  <button (click)="generatePdf(visit.id)" class="btn-icon" title="Gerar PDF"><i class="bi bi-file-earmark-pdf"></i></button>
                  <button (click)="openGoogleCalendar(visit)" class="btn-icon google" title="Adicionar ao Google Agenda">
                    <i class="bi bi-calendar-plus"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredVisits.length === 0">
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
      background: var(--color-bg-primary);
    }

    app-page-header {
      --page-header-bg: transparent;
      --page-header-shadow: none;
      --page-header-border: none;
      --page-header-padding: 2.5rem 2.5rem 1rem;
      --page-header-title-size: 2.4rem;
    }

    .content-wrapper {
      margin: 1rem 2.5rem 2.5rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 24px rgba(59, 130, 246, 0.3);
    }

    .table-card {
      background: var(--color-bg-secondary);
      margin-top: 2rem;
      padding: 0;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid var(--color-border-light);
    }

    .table-header {
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid var(--color-border-light);
    }

    .table-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--color-text-primary);
      font-weight: 700;
    }

    .table-header p {
      margin: 0.35rem 0 0;
      color: var(--color-text-secondary);
      font-size: 0.85rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: var(--color-bg-tertiary);
      padding: 1rem 1.25rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--color-border-light);
    }

    .data-table td {
      padding: 1.1rem 1.25rem;
      border-bottom: 1px solid var(--color-border-light);
      color: var(--color-text-primary);
    }

    .data-table tbody tr {
      transition: background 0.2s ease;
    }

    .data-table tbody tr:hover {
      background: var(--color-bg-tertiary);
    }

    .visit-main {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .visit-sub {
      font-size: 0.8rem;
      color: var(--color-text-tertiary);
      margin-top: 0.25rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(59, 130, 246, 0.12);
      color: var(--color-primary);
    }

    .badge-agendada { background: rgba(14, 165, 233, 0.15); color: #0284c7; }
    .badge-confirmada { background: rgba(16, 185, 129, 0.15); color: #059669; }
    .badge-realizada { background: rgba(100, 116, 139, 0.2); color: #475569; }
    .badge-cancelada { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid var(--color-border-light);
      background: var(--color-bg-secondary);
      color: var(--color-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 0.35rem;
    }

    .btn-icon:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .btn-icon.danger {
      color: #dc2626;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .btn-icon.google {
      color: #1a73e8;
      border-color: rgba(26, 115, 232, 0.25);
    }

    .text-center {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-tertiary);
      font-style: italic;
    }

    @media (max-width: 768px) {
      app-page-header {
        --page-header-padding: 1.5rem;
        margin: 1rem;
      }

      .content-wrapper {
        margin: 1rem;
        padding: 1.5rem;
      }

      .table-card {
        padding: 0;
      }

      .data-table {
        font-size: 0.85rem;
      }
    }
  `]
})
export class VisitListComponent implements OnInit {
  visits: Visit[] = [];
  visibleVisits: Visit[] = [];
  filteredVisits: Visit[] = [];
  showForm = false;
  editingVisit: Visit | null = null;
  currentView: 'day' | 'week' | 'month' = 'month';
  currentDate: Date = new Date();
  searchTerm = '';
  statusFilter = '';

  constructor(
    private visitService: VisitService,
    private pdfService: VisitPdfService,
    private popupService: PopupService,
    private googleCalendarService: GoogleCalendarService
  ) {}

  async ngOnInit() {
    await this.loadVisits();
  }

  async loadVisits() {
    try {
      this.visits = await this.visitService.getAll();
      this.applyFilter();
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

  async deleteVisit(visit: Visit) {
    const confirmed = await this.popupService.confirm('Tem certeza que deseja excluir esta visita?', {
      title: 'Excluir visita',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;
    try {
      try {
        await this.googleCalendarService.syncVisitFromVisit(visit, {
          title: 'Visita excluida',
          details: this.buildDeletionDetails(visit)
        });
      } catch (syncError) {
        console.error('Error syncing deletion to Google Calendar:', syncError);
      }
      await this.visitService.delete(visit.id);
      await this.loadVisits();
    } catch (error) {
      console.error('Error deleting visit:', error);
    }
  }

  onViewChange(view: 'day' | 'week' | 'month') {
    this.currentView = view;
    this.applyFilter();
  }

  onDateChange(date: Date) {
    this.currentDate = date;
    this.applyFilter();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.applyFilter();
  }

  onStatusFilterChange(value: string) {
    this.statusFilter = value;
    this.applyFilter();
  }

  async generatePdf(visitId: string) {
    try {
      const visitWithDetails = await this.visitService.getVisitWithDetails(visitId);
      if (visitWithDetails) {
        this.pdfService.generateVisitPdf(visitWithDetails);
      } else {
        console.error('Visit not found');
        this.showError('Erro ao carregar dados da visita.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.showError('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  }

  async openGoogleCalendar(visit: Visit) {
    try {
      await this.googleCalendarService.syncVisitFromVisit(visit);
      this.popupService.alert('Visita sincronizada com o Google Agenda.', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Error syncing visit to Google Calendar:', error);
      this.showError('Nao foi possivel sincronizar. Verifique se o Google Agenda esta conectado nas configuracoes.');
    }
  }

  private showError(message: string) {
    this.popupService.alert(message, { title: 'Aviso', tone: 'warning' });
  }

  private buildDeletionDetails(visit: Visit): string {
    const lines: string[] = [];
    lines.push('Status: excluida no CRM');
    if (visit.property_id) lines.push(`Imovel: ${visit.property_id}`);
    if (visit.client_id) lines.push(`Cliente: ${visit.client_id}`);
    if (visit.notes) lines.push(`Observacoes: ${visit.notes}`);
    lines.push(`Visita ID: ${visit.id}`);
    return lines.join('\n');
  }

  private applyFilter() {
    const { start, end } = this.getCurrentRange();
    const baseFiltered = this.getBaseFilteredVisits();

    this.visibleVisits = baseFiltered;

    this.filteredVisits = (baseFiltered || [])
      .filter(visit => {
        const visitDate = this.parseVisitDateLocal(visit.visit_date);
        if (!visitDate) return false;
        return visitDate >= start && visitDate <= end;
      })
      .sort((a, b) => {
        const aDate = this.parseVisitDateLocal(a.visit_date);
        const bDate = this.parseVisitDateLocal(b.visit_date);
        if (!aDate || !bDate) return 0;
        const dateDiff = aDate.getTime() - bDate.getTime();
        if (dateDiff !== 0) return dateDiff;
        return String(a.visit_time || '').localeCompare(String(b.visit_time || ''));
      });
  }

  private getBaseFilteredVisits(): Visit[] {
    const term = this.searchTerm.trim().toLowerCase();
    const status = this.statusFilter;

    return (this.visits || []).filter(visit => {
      if (status && (visit.status || 'agendada') !== status) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        visit.notes,
        visit.visit_date,
        visit.visit_time,
        visit.status,
        visit.property_id,
        visit.client_id
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  private getCurrentRange(): { start: Date; end: Date } {
    const base = new Date(this.currentDate);

    if (this.currentView === 'day') {
      const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
      const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
      return { start, end };
    }

    if (this.currentView === 'week') {
      // Consistente com o calendário: semana começa no Domingo
      const day = base.getDay(); // 0 = domingo
      const weekStart = new Date(base.getFullYear(), base.getMonth(), base.getDate() - day, 0, 0, 0, 0);
      const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6, 23, 59, 59, 999);
      return { start: weekStart, end: weekEnd };
    }

    // month
    const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  formatVisitDate(value?: string | null): string {
    const parsed = this.parseVisitDateLocal(value);
    if (!parsed) return '-';
    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private parseVisitDateLocal(value?: string | null): Date | null {
    if (!value) return null;
    const parts = value.split('-').map(part => Number(part));
    if (parts.length !== 3 || parts.some(part => Number.isNaN(part))) return null;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }
}
