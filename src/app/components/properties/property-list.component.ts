import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { PropertyFormComponent } from './property-form.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PropertyFormComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Imóveis</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Cancelar' : '+ Novo Imóvel' }}
        </button>
      </div>

      <app-property-form
        *ngIf="showForm"
        [editingProperty]="editingProperty"
        (save)="saveProperty($event)"
        (cancel)="cancelForm()">
      </app-property-form>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Endereço</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of properties">
              <td>{{ property.type || '-' }}</td>
              <td>{{ property.street || '-' }}</td>
              <td>{{ property.neighborhood || '-' }}</td>
              <td>{{ property.city || '-' }}</td>
              <td>{{ property.price | currency:'BRL' }}</td>
              <td>
                <button (click)="editProperty(property)" class="btn-sm">Editar</button>
                <button (click)="deleteProperty(property.id)" class="btn-sm btn-danger">Excluir</button>
              </td>
            </tr>
            <tr *ngIf="properties.length === 0">
              <td colspan="6" class="text-center">Nenhum imóvel cadastrado</td>
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
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  showForm = false;
  editingProperty: Property | null = null;

  constructor(private propertyService: PropertyService) {}

  async ngOnInit() {
    await this.loadProperties();
  }

  async loadProperties() {
    try {
      this.properties = await this.propertyService.getAll();
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  editProperty(property: Property) {
    this.editingProperty = property;
    this.showForm = true;
  }

  async saveProperty(formData: any) {
    try {
      if (this.editingProperty) {
        await this.propertyService.update(this.editingProperty.id, formData);
      } else {
        await this.propertyService.create(formData);
      }
      this.showForm = false;
      this.editingProperty = null;
      await this.loadProperties();
    } catch (error) {
      console.error('Error saving property:', error);
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editingProperty = null;
  }

  async deleteProperty(id: string) {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        await this.propertyService.delete(id);
        await this.loadProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  }
}
