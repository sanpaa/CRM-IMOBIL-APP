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

      <!-- Total Summary Section -->
      <div class="totals-summary">
        <div class="summary-card summary-total">
          <div class="summary-label">Valor Total de Vendas</div>
          <div class="summary-value">{{ getTotalValue() | currency:'BRL' }}</div>
        </div>
        <div class="summary-card" *ngFor="let status of statuses">
          <div class="summary-label">{{ status.label }}</div>
          <div class="summary-value-small">{{ getTotalByStatus(status.value) | currency:'BRL' }}</div>
          <div class="summary-count">{{ getDealsByStatus(status.value).length }} negócio(s)</div>
        </div>
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
    .page-container {
      min-height: 100vh;
      background: #F5F7FA;
    }

    .page-header {
      background: #FFFFFF;
      padding: 2rem 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-bottom: 1px solid #E5E7EB;
    }

    .page-header h1 {
      margin: 0;
      color: #1F2933;
      font-size: 2rem;
      font-weight: 700;
    }

    .btn-primary {
      padding: 0.875rem 1.75rem;
      background: #374151;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(55, 65, 81, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      background: #1F2937;
      box-shadow: 0 4px 12px rgba(55, 65, 81, 0.3);
    }

    .form-card {
      background: #FFFFFF;
      margin: 2rem 2.5rem;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #E5E7EB;
    }

    .form-card h2 {
      margin: 0 0 2rem 0;
      color: #1F2933;
      font-size: 1.5rem;
      font-weight: 700;
      padding-bottom: 1rem;
      border-bottom: 2px solid #E5E7EB;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      color: #6B7280;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-control {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
      color: #1F2933;
    }

    .form-control:focus {
      outline: none;
      border-color: #374151;
      box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
    }

    select.form-control {
      cursor: pointer;
      background-color: white;
    }

    .totals-summary {
      margin: 2rem 2.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .summary-card {
      background: #FFFFFF;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #E5E7EB;
      transition: all 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .summary-total {
      grid-column: 1 / -1;
      background: #374151;
      color: white;
      border: none;
    }

    .summary-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.75rem;
      opacity: 0.9;
    }

    .summary-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .summary-value-small {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1F2933;
      margin-bottom: 0.5rem;
    }

    .summary-count {
      font-size: 0.85rem;
      color: #6B7280;
      font-weight: 500;
    }

    .deals-kanban {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 2rem 2.5rem;
    }

    .kanban-column {
      background: #FFFFFF;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #E5E7EB;
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #E5E7EB;
    }

    .column-header h3 {
      margin: 0;
      color: #1F2933;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .count {
      background: #374151;
      color: white;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .deal-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 200px;
    }

    .deal-card {
      background: #F5F7FA;
      padding: 1.25rem;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-left: 4px solid #374151;
      transition: all 0.2s ease;
    }

    .deal-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .deal-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1F2933;
      margin-bottom: 0.5rem;
    }

    .deal-status {
      font-size: 0.85rem;
      color: #6B7280;
      margin-bottom: 1rem;
      text-transform: capitalize;
      font-weight: 500;
    }

    .deal-actions {
      display: flex;
      gap: 0.5rem;
    }

    .empty-column {
      text-align: center;
      padding: 3rem 1rem;
      color: #6B7280;
      font-size: 0.9rem;
      font-style: italic;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      background: #6B7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-sm:hover {
      background: #4B5563;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #DC2626;
    }

    .btn-danger:hover {
      background: #B91C1C;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .deals-kanban {
        grid-template-columns: 1fr;
        padding: 1.5rem;
      }

      .page-header, .form-card {
        margin: 1rem;
        padding: 1.5rem;
      }
    }
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

  getTotalValue(): number {
    return this.deals.reduce((sum, deal) => sum + (deal.proposed_value || 0), 0);
  }

  getTotalByStatus(status: string): number {
    return this.getDealsByStatus(status).reduce((sum, deal) => sum + (deal.proposed_value || 0), 0);
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
