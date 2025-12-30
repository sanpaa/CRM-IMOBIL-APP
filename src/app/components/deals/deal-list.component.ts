import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DealService } from '../../services/deal.service';
import { Deal } from '../../models/deal.model';

@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Negócios / Propostas</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Cancelar' : '+ Novo Negócio' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h2>{{ editingDeal ? 'Editar Negócio' : 'Novo Negócio' }}</h2>
        <form (ngSubmit)="saveDeal()">
          <div class="form-row">
            <div class="form-group">
              <label>Valor Proposto</label>
              <input type="number" [(ngModel)]="formData.proposed_value" name="proposed_value" class="form-control">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="formData.status" name="status" class="form-control">
                <option value="proposta">Proposta</option>
                <option value="negociacao">Em Negociação</option>
                <option value="aceito">Aceito</option>
                <option value="fechado">Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn-primary">Salvar</button>
        </form>
      </div>

      <div class="deals-kanban">
        <div class="kanban-column" *ngFor="let status of statuses">
          <div class="column-header">
            <h3>{{ status.label }}</h3>
            <span class="count">{{ getDealsByStatus(status.value).length }}</span>
          </div>
          <div class="deal-cards">
            <div class="deal-card" *ngFor="let deal of getDealsByStatus(status.value)">
              <div class="deal-value">{{ deal.proposed_value | currency:'BRL' }}</div>
              <div class="deal-status">{{ deal.status }}</div>
              <div class="deal-actions">
                <button (click)="editDeal(deal)" class="btn-sm">Editar</button>
                <button (click)="deleteDeal(deal.id)" class="btn-sm btn-danger">Excluir</button>
              </div>
            </div>
            <div class="empty-column" *ngIf="getDealsByStatus(status.value).length === 0">
              Nenhum negócio
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; }
    .btn-primary:hover { background: #5568d3; }
    .form-card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .form-card h2 { margin-top: 0; color: #2c3e50; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
    
    .deals-kanban { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .kanban-column { background: #f8f9fa; border-radius: 10px; padding: 1rem; }
    .column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #dee2e6; }
    .column-header h3 { margin: 0; color: #2c3e50; font-size: 1rem; }
    .count { background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.85rem; }
    
    .deal-cards { display: flex; flex-direction: column; gap: 0.75rem; }
    .deal-card { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .deal-value { font-size: 1.2rem; font-weight: 600; color: #2c3e50; margin-bottom: 0.5rem; }
    .deal-status { font-size: 0.85rem; color: #6c757d; margin-bottom: 0.75rem; text-transform: capitalize; }
    .deal-actions { display: flex; gap: 0.5rem; }
    
    .empty-column { text-align: center; padding: 2rem 1rem; color: #6c757d; font-size: 0.9rem; }
    
    .btn-sm { padding: 0.35rem 0.75rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .btn-sm:hover { background: #5a6268; }
    .btn-danger { background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
  `]
})
export class DealListComponent implements OnInit {
  deals: Deal[] = [];
  showForm = false;
  editingDeal: Deal | null = null;
  formData: any = {};

  statuses = [
    { value: 'proposta', label: 'Proposta' },
    { value: 'negociacao', label: 'Em Negociação' },
    { value: 'aceito', label: 'Aceito' },
    { value: 'fechado', label: 'Fechado' },
    { value: 'perdido', label: 'Perdido' }
  ];

  constructor(private dealService: DealService) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadDeals();
  }

  async loadDeals() {
    try {
      this.deals = await this.dealService.getAll();
    } catch (error) {
      console.error('Error loading deals:', error);
    }
  }

  getDealsByStatus(status: string): Deal[] {
    return this.deals.filter(deal => deal.status === status);
  }

  resetForm() {
    this.formData = {
      proposed_value: 0,
      status: 'proposta'
    };
  }

  editDeal(deal: Deal) {
    this.editingDeal = deal;
    this.formData = { ...deal };
    this.showForm = true;
  }

  async saveDeal() {
    try {
      if (this.editingDeal) {
        await this.dealService.update(this.editingDeal.id, this.formData);
      } else {
        await this.dealService.create(this.formData);
      }
      this.showForm = false;
      this.editingDeal = null;
      this.resetForm();
      await this.loadDeals();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  }

  async deleteDeal(id: string) {
    if (confirm('Tem certeza que deseja excluir este negócio?')) {
      try {
        await this.dealService.delete(id);
        await this.loadDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
      }
    }
  }
}
