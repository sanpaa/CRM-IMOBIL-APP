import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Clientes</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Cancelar' : '+ Novo Cliente' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h2>{{ editingClient ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
        <form (ngSubmit)="saveClient()">
          <div class="form-row">
            <div class="form-group">
              <label>Nome *</label>
              <input type="text" [(ngModel)]="formData.name" name="name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="formData.email" name="email" class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telefone</label>
              <input type="text" [(ngModel)]="formData.phone" name="phone" class="form-control">
            </div>
            <div class="form-group">
              <label>WhatsApp</label>
              <input type="text" [(ngModel)]="formData.whatsapp" name="whatsapp" class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Origem</label>
              <input type="text" [(ngModel)]="formData.origin" name="origin" class="form-control">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="formData.status" name="status" class="form-control">
                <option value="lead">Lead</option>
                <option value="contato">Em Contato</option>
                <option value="interessado">Interessado</option>
                <option value="cliente">Cliente</option>
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
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Origem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of clients">
              <td>{{ client.name }}</td>
              <td>{{ client.email || '-' }}</td>
              <td>{{ client.phone || '-' }}</td>
              <td><span class="badge">{{ client.status || 'lead' }}</span></td>
              <td>{{ client.origin || '-' }}</td>
              <td>
                <button (click)="editClient(client)" class="btn-sm">Editar</button>
                <button (click)="deleteClient(client.id)" class="btn-sm btn-danger">Excluir</button>
              </td>
            </tr>
            <tr *ngIf="clients.length === 0">
              <td colspan="6" class="text-center">Nenhum cliente cadastrado</td>
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
    .btn-sm { padding: 0.35rem 0.75rem; margin-right: 0.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .btn-sm:hover { background: #5a6268; }
    .btn-danger { background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .text-center { text-align: center; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  showForm = false;
  editingClient: Client | null = null;
  formData: any = {};

  constructor(private clientService: ClientService) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getAll();
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      origin: '',
      status: 'lead',
      notes: ''
    };
  }

  editClient(client: Client) {
    this.editingClient = client;
    this.formData = { ...client };
    this.showForm = true;
  }

  async saveClient() {
    try {
      if (this.editingClient) {
        await this.clientService.update(this.editingClient.id, this.formData);
      } else {
        await this.clientService.create(this.formData);
      }
      this.showForm = false;
      this.editingClient = null;
      this.resetForm();
      await this.loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  }

  async deleteClient(id: string) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await this.clientService.delete(id);
        await this.loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  }
}
