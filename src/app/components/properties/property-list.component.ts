import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth.service';
import { Property } from '../../models/property.model';
import { Owner } from '../../models/owner.model';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  owners: Owner[] = [];
  showForm = false;
  editingProperty: Property | null = null;
  formData: any = {};
  
  // Filters
  searchTerm = '';
  filterType = '';
  filterCity = '';
  filterSold = '';

  constructor(
    private propertyService: PropertyService,
    private ownerService: OwnerService,
    public authService: AuthService
  ) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadProperties();
    await this.loadOwners();
  }

  async loadProperties() {
    try {
      this.properties = await this.propertyService.getAll();
      this.filteredProperties = [...this.properties];
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  async loadOwners() {
    try {
      this.owners = await this.ownerService.getAll();
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  }

  async applyFilters() {
    try {
      this.filteredProperties = await this.propertyService.getFiltered({
        type: this.filterType || undefined,
        city: this.filterCity || undefined,
        sold: this.filterSold !== '' ? this.filterSold === 'true' : undefined,
        searchTerm: this.searchTerm || undefined
      });
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterType = '';
    this.filterCity = '';
    this.filterSold = '';
    this.filteredProperties = [...this.properties];
  }

  resetForm() {
    this.formData = {
      title: '',
      description: '',
      type: 'apartamento',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      parking: 0,
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      contact: '',
      owner_id: '',
      featured: false,
      sold: false
    };
  }

  openModal(property?: Property) {
    if (property) {
      this.editingProperty = property;
      this.formData = { ...property };
    } else {
      this.editingProperty = null;
      this.resetForm();
    }
    this.showForm = true;
  }

  closeModal() {
    this.showForm = false;
    this.editingProperty = null;
    this.resetForm();
  }

  async saveProperty() {
    try {
      if (this.editingProperty) {
        await this.propertyService.update(this.editingProperty.id, this.formData);
      } else {
        await this.propertyService.create(this.formData);
      }
      this.closeModal();
      await this.loadProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Erro ao salvar imóvel');
    }
  }

  async deleteProperty(id: string) {
    if (!this.authService.isAdmin()) {
      alert('Apenas administradores podem excluir imóveis');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        await this.propertyService.delete(id);
        await this.loadProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Erro ao excluir imóvel');
      }
    }
  }

  getOwnerName(ownerId?: string): string {
    if (!ownerId) return '-';
    const owner = this.owners.find(o => o.id === ownerId);
    return owner ? owner.name : '-';
  }
}
