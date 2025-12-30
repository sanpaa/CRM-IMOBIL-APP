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

    .form-card, .table-card {
      background: white;
      margin: 2rem 2.5rem;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .form-card h2 {
      margin: 0 0 2rem 0;
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 700;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
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
      color: #475569;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-control {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    select.form-control {
      cursor: pointer;
      background-color: white;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: inline-block;
    }

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

    .text-center {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .page-header, .form-card, .table-card {
        margin: 1rem;
        padding: 1.5rem;
      }

      .data-table {
        font-size: 0.85rem;
      }
    }
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
