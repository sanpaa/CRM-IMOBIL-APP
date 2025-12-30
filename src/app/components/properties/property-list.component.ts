import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Imóveis</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Cancelar' : '+ Novo Imóvel' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h2>{{ editingProperty ? 'Editar Imóvel' : 'Novo Imóvel' }}</h2>
        <form (ngSubmit)="saveProperty()">
          <div class="form-row">
            <div class="form-group">
              <label>Tipo</label>
              <select [(ngModel)]="formData.type" name="type" class="form-control">
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
            <div class="form-group">
              <label>Finalidade</label>
              <select [(ngModel)]="formData.purpose" name="purpose" class="form-control">
                <option value="venda">Venda</option>
                <option value="locacao">Locação</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Endereço</label>
              <input type="text" [(ngModel)]="formData.address" name="address" class="form-control">
            </div>
            <div class="form-group">
              <label>Número</label>
              <input type="text" [(ngModel)]="formData.number" name="number" class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Bairro</label>
              <input type="text" [(ngModel)]="formData.neighborhood" name="neighborhood" class="form-control">
            </div>
            <div class="form-group">
              <label>Cidade</label>
              <input type="text" [(ngModel)]="formData.city" name="city" class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Valor</label>
              <input type="number" [(ngModel)]="formData.value" name="value" class="form-control">
            </div>
            <div class="form-group">
              <label>IPTU</label>
              <input type="number" [(ngModel)]="formData.iptu" name="iptu" class="form-control">
            </div>
            <div class="form-group">
              <label>Condomínio</label>
              <input type="number" [(ngModel)]="formData.condominium" name="condominium" class="form-control">
            </div>
          </div>
          <button type="submit" class="btn-primary">Salvar</button>
        </form>
      </div>

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
              <td>{{ property.address }}, {{ property.number }}</td>
              <td>{{ property.neighborhood || '-' }}</td>
              <td>{{ property.city || '-' }}</td>
              <td>{{ property.value | currency:'BRL' }}</td>
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
    .btn-sm { padding: 0.35rem 0.75rem; margin-right: 0.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .btn-sm:hover { background: #5a6268; }
    .btn-danger { background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .text-center { text-align: center; }
  `]
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  showForm = false;
  editingProperty: Property | null = null;
  formData: any = {};

  constructor(private propertyService: PropertyService) {
    this.resetForm();
  }

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

  resetForm() {
    this.formData = {
      type: 'apartamento',
      purpose: 'venda',
      address: '',
      number: '',
      neighborhood: '',
      city: '',
      value: 0,
      iptu: 0,
      condominium: 0
    };
  }

  editProperty(property: Property) {
    this.editingProperty = property;
    this.formData = { ...property };
    this.showForm = true;
  }

  async saveProperty() {
    try {
      if (this.editingProperty) {
        await this.propertyService.update(this.editingProperty.id, this.formData);
      } else {
        await this.propertyService.create(this.formData);
      }
      this.showForm = false;
      this.editingProperty = null;
      this.resetForm();
      await this.loadProperties();
    } catch (error) {
      console.error('Error saving property:', error);
    }
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
