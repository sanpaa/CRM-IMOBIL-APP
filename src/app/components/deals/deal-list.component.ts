import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DealService } from '../../services/deal.service';
import { ClientService } from '../../services/client.service';
import { PropertyService } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { Deal } from '../../models/deal.model';
import { Client } from '../../models/client.model';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Negócios / Propostas</h1>
        <div class="header-actions">
          <button (click)="showFilters = true" class="btn-secondary">
            Filtros
          </button>
          <button (click)="toggleForm()" class="btn-primary">
            {{ showForm ? 'Cancelar' : '+ Novo Negócio' }}
          </button>
        </div>
      </div>

      <!-- Filters Modal -->
      <div class="modal-overlay" *ngIf="showFilters" (click)="closeFilters()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Filtros</h3>
            <button class="modal-close" (click)="closeFilters()">×</button>
          </div>
          <div class="modal-body">
            <div class="filters-row">
              <div class="filter-group">
                <label>Status</label>
                <select [(ngModel)]="filters.status" (change)="applyFilters()" class="form-control">
                  <option value="">Todos</option>
                  <option value="proposta">Proposta</option>
                  <option value="negociacao">Em Negociação</option>
                  <option value="aceito">Aceito</option>
                  <option value="fechado">Fechado</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Cliente</label>
                <select [(ngModel)]="filters.client_id" (change)="applyFilters()" class="form-control">
                  <option value="">Todos</option>
                  <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Imóvel</label>
                <select [(ngModel)]="filters.property_id" (change)="applyFilters()" class="form-control">
                  <option value="">Todos</option>
                  <option *ngFor="let property of properties" [value]="property.id">{{ property.title }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Corretor</label>
                <select [(ngModel)]="filters.user_id" (change)="applyFilters()" class="form-control">
                  <option value="">Todos</option>
                  <option *ngFor="let user of users" [value]="user.id">{{ user.name }}</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button (click)="clearFilters()" class="btn-secondary">Limpar Filtros</button>
              <button (click)="closeFilters()" class="btn-primary">Fechar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingDeal ? 'Editar Negócio' : 'Novo Negócio' }}</h3>
            <button class="modal-close" (click)="closeForm()">×</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveDeal()">
              <div class="form-row">
                <div class="form-group">
                  <label>Cliente *</label>
                  <select [(ngModel)]="formData.client_id" name="client_id" class="form-control" required>
                    <option value="">Selecione um cliente</option>
                    <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Imóvel</label>
                  <select [(ngModel)]="formData.property_id" name="property_id" class="form-control">
                    <option value="">Selecione um imóvel</option>
                    <option *ngFor="let property of properties" [value]="property.id">{{ property.title }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Corretor Responsável</label>
                  <select [(ngModel)]="formData.user_id" name="user_id" class="form-control">
                    <option value="">Selecione um corretor</option>
                    <option *ngFor="let user of users" [value]="user.id">{{ user.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Valor Proposto *</label>
                  <input type="number" [(ngModel)]="formData.proposed_value" name="proposed_value" class="form-control" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Status *</label>
                  <select [(ngModel)]="formData.status" name="status" class="form-control" required>
                    <option value="proposta">Proposta</option>
                    <option value="negociacao">Em Negociação</option>
                    <option value="aceito">Aceito</option>
                    <option value="fechado">Fechado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Data de Fechamento</label>
                  <input type="date" [(ngModel)]="formData.closed_at" name="closed_at" class="form-control">
                </div>
              </div>
              <div class="modal-actions modal-actions-right">
                <button type="button" (click)="closeForm()" class="btn-secondary">Cancelar</button>
                <button type="submit" class="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
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

      <!-- Kanban Board -->
      <div class="deals-kanban">
        <div class="kanban-column" *ngFor="let status of statuses">
          <div class="column-header">
            <h3>{{ status.label }}</h3>
            <span class="count">{{ getDealsByStatus(status.value).length }}</span>
          </div>
          <div class="deal-cards">
            <div class="deal-card" *ngFor="let deal of getDealsByStatus(status.value)">
              <div class="deal-value">{{ deal.proposed_value | currency:'BRL' }}</div>
              <div class="deal-info">
                <div class="info-row" *ngIf="deal.client">
                  <strong>👤 Cliente:</strong>
                  <span>{{ deal.client.name }}</span>
                </div>
                <div class="info-row" *ngIf="deal.property">
                  <strong>🏠 Imóvel:</strong>
                  <span>{{ deal.property.title }}</span>
                </div>
                <div class="info-row" *ngIf="deal.user">
                  <strong>👨‍💼 Corretor:</strong>
                  <span>{{ deal.user.name }}</span>
                </div>
                <div class="info-row">
                  <strong>📅 Criado:</strong>
                  <span>{{ deal.created_at | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-row" *ngIf="deal.closed_at">
                  <strong>✅ Fechado:</strong>
                  <span>{{ deal.closed_at | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
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
      background: var(--color-bg-primary);
    }

    .page-header {
      background: var(--color-bg-secondary);
      padding: 2rem 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-bottom: 1px solid #E5E7EB;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header h1 {
      margin: 0;
      color: var(--color-text-primary);
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

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #6B7280;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #4B5563;
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      margin-bottom: 0.5rem;
      color: #6B7280;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--color-bg-secondary);
      border-radius: 12px;
      width: 90%;
      max-width: 760px;
      max-height: 90vh;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-content.modal-large {
      max-width: 900px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #E5E7EB;
      background: #F9FAFB;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .modal-close {
      border: none;
      background: transparent;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6B7280;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .modal-close:hover {
      background: #E5E7EB;
      color: #111827;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .modal-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .modal-actions.modal-actions-right {
      justify-content: flex-end;
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
      color: var(--color-text-primary);
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
      background: var(--color-bg-secondary);
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid var(--color-border-light);
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
      color: var(--color-text-primary);
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
      background: var(--color-bg-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid var(--color-border-light);
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
      color: var(--color-text-primary);
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
      background: var(--color-bg-primary);
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
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 1rem;
    }

    .deal-info {
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .info-row strong {
      color: #6B7280;
      font-weight: 600;
    }

    .info-row span {
      color: var(--color-text-primary);
      font-weight: 500;
      text-align: right;
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

      .filters-row {
        grid-template-columns: 1fr;
      }

      .deals-kanban {
        grid-template-columns: 1fr;
        padding: 1.5rem;
      }

      .page-header {
        margin: 1rem;
        padding: 1.5rem;
      }

      .modal-content {
        width: 94%;
        max-height: 95vh;
      }

      .modal-body {
        padding: 1.25rem;
      }
    }
  `]
})
export class DealListComponent implements OnInit {
  deals: Deal[] = [];
  filteredDeals: Deal[] = [];
  clients: Client[] = [];
  properties: Property[] = [];
  users: User[] = [];
  showForm = false;
  showFilters = false;
  editingDeal: Deal | null = null;
  formData: any = {};
  filters: any = {
    status: '',
    client_id: '',
    property_id: '',
    user_id: ''
  };

  statuses = [
    { value: 'proposta', label: 'Proposta' },
    { value: 'negociacao', label: 'Em Negociação' },
    { value: 'aceito', label: 'Aceito' },
    { value: 'fechado', label: 'Fechado' },
    { value: 'perdido', label: 'Perdido' }
  ];

  constructor(
    private dealService: DealService,
    private clientService: ClientService,
    private propertyService: PropertyService,
    private userService: UserService
  ) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await Promise.all([
        this.loadDeals(),
        this.loadClients(),
        this.loadProperties(),
        this.loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadDeals() {
    try {
      this.deals = await this.dealService.getAll();
      this.filteredDeals = [...this.deals];
    } catch (error) {
      console.error('Error loading deals:', error);
    }
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getAll();
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async loadProperties() {
    try {
      this.properties = await this.propertyService.getAll();
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  async loadUsers() {
    try {
      this.users = await this.userService.getAll();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async applyFilters() {
    try {
      const activeFilters: any = {};
      if (this.filters.status) activeFilters.status = this.filters.status;
      if (this.filters.client_id) activeFilters.client_id = this.filters.client_id;
      if (this.filters.property_id) activeFilters.property_id = this.filters.property_id;
      if (this.filters.user_id) activeFilters.user_id = this.filters.user_id;

      if (Object.keys(activeFilters).length > 0) {
        this.filteredDeals = await this.dealService.getAllWithFilters(activeFilters);
      } else {
        this.filteredDeals = [...this.deals];
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  clearFilters() {
    this.filters = {
      status: '',
      client_id: '',
      property_id: '',
      user_id: ''
    };
    this.filteredDeals = [...this.deals];
  }

  closeFilters() {
    this.showFilters = false;
  }

  getDealsByStatus(status: string): Deal[] {
    return this.filteredDeals.filter(deal => deal.status === status);
  }

  getTotalValue(): number {
    return this.filteredDeals.reduce((sum, deal) => sum + (deal.proposed_value || 0), 0);
  }

  getTotalByStatus(status: string): number {
    return this.getDealsByStatus(status).reduce((sum, deal) => sum + (deal.proposed_value || 0), 0);
  }

  resetForm() {
    this.formData = {
      client_id: '',
      property_id: '',
      user_id: '',
      proposed_value: 0,
      status: 'proposta',
      closed_at: ''
    };
  }

  toggleForm() {
    if (this.showForm) {
      this.closeForm();
      return;
    }
    this.editingDeal = null;
    this.resetForm();
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingDeal = null;
    this.resetForm();
  }

  editDeal(deal: Deal) {
    this.editingDeal = deal;
    this.formData = {
      client_id: deal.client_id || '',
      property_id: deal.property_id || '',
      user_id: deal.user_id || '',
      proposed_value: deal.proposed_value || 0,
      status: deal.status || 'proposta',
      closed_at: deal.closed_at ? new Date(deal.closed_at).toISOString().split('T')[0] : ''
    };
    this.showForm = true;
  }

  async saveDeal() {
    try {
      // Validate required fields
      if (!this.formData.client_id) {
        alert('Por favor, selecione um cliente');
        return;
      }
      if (!this.formData.proposed_value || this.formData.proposed_value <= 0) {
        alert('Por favor, insira um valor proposto válido');
        return;
      }

      const dealData: any = {
        client_id: this.formData.client_id || null,
        property_id: this.formData.property_id || null,
        user_id: this.formData.user_id || null,
        proposed_value: this.formData.proposed_value,
        status: this.formData.status,
        closed_at: this.formData.closed_at || null
      };

      if (this.editingDeal) {
        await this.dealService.update(this.editingDeal.id, dealData);
      } else {
        await this.dealService.create(dealData);
      }
      this.showForm = false;
      this.editingDeal = null;
      this.resetForm();
      await this.loadDeals();
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Erro ao salvar negócio. Por favor, tente novamente.');
    }
  }

  async deleteDeal(id: string) {
    if (confirm('Tem certeza que deseja excluir este negócio?')) {
      try {
        await this.dealService.delete(id);
        await this.loadDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
        alert('Erro ao excluir negócio. Por favor, tente novamente.');
      }
    }
  }
}
