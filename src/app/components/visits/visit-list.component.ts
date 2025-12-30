import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VisitService } from '../../services/visit.service';
import { Visit } from '../../models/visit.model';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Visitas Agendadas</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Cancelar' : '+ Nova Visita' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h2>{{ editingVisit ? 'Editar Visita' : 'Nova Visita' }}</h2>
        <form (ngSubmit)="saveVisit()">
          <div class="form-row">
            <div class="form-group">
              <label>Data da Visita *</label>
              <input type="date" [(ngModel)]="formData.visit_date" name="visit_date" required class="form-control">
            </div>
            <div class="form-group">
              <label>Horário *</label>
              <input type="time" [(ngModel)]="formData.visit_time" name="visit_time" required class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="formData.status" name="status" class="form-control">
                <option value="agendada">Agendada</option>
                <option value="confirmada">Confirmada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Observações</label>
            <textarea [(ngModel)]="formData.notes" name="notes" rows="3" class="form-control"></textarea>
          </div>
          <button type="submit" class="btn-primary">Salvar</button>
        </form>
      </div>

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
              </td>
            </tr>
            <tr *ngIf="visits.length === 0">
              <td colspan="5" class="text-center">Nenhuma visita agendada</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; }
    .btn-primary:hover { background: #5568d3; }
    .form-card, .table-card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .form-card h2 { margin-top: 0; color: #2c3e50; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; color: #2c3e50; border-bottom: 2px solid #dee2e6; }
    .data-table td { padding: 1rem; border-bottom: 1px solid #dee2e6; }
    .badge { padding: 0.25rem 0.75rem; background: #667eea; color: white; border-radius: 12px; font-size: 0.85rem; }
    .badge-agendada { background: #17a2b8; }
    .badge-confirmada { background: #28a745; }
    .badge-realizada { background: #6c757d; }
    .badge-cancelada { background: #dc3545; }
    .btn-sm { padding: 0.35rem 0.75rem; margin-right: 0.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .btn-sm:hover { background: #5a6268; }
    .btn-danger { background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .text-center { text-align: center; }
  `]
})
export class VisitListComponent implements OnInit {
  visits: Visit[] = [];
  showForm = false;
  editingVisit: Visit | null = null;
  formData: any = {};

  constructor(private visitService: VisitService) {
    this.resetForm();
  }

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

  resetForm() {
    this.formData = {
      visit_date: '',
      visit_time: '',
      status: 'agendada',
      notes: ''
    };
  }

  editVisit(visit: Visit) {
    this.editingVisit = visit;
    this.formData = { ...visit };
    this.showForm = true;
  }

  async saveVisit() {
    try {
      if (this.editingVisit) {
        await this.visitService.update(this.editingVisit.id, this.formData);
      } else {
        await this.visitService.create(this.formData);
      }
      this.showForm = false;
      this.editingVisit = null;
      this.resetForm();
      await this.loadVisits();
    } catch (error) {
      console.error('Error saving visit:', error);
    }
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
}
