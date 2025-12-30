import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Owner } from '../../models/owner.model';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-owner-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './owner-list.component.html',
  styleUrls: ['./owner-list.component.scss']
})
export class OwnerListComponent implements OnInit {
  owners: Owner[] = [];
  showForm = false;
  editingOwner: Owner | null = null;
  formData: any = {};
  
  // Properties linked to owner
  ownerProperties: Property[] = [];
  showPropertiesModal = false;
  selectedOwner: Owner | null = null;

  constructor(
    private ownerService: OwnerService,
    private propertyService: PropertyService,
    public authService: AuthService
  ) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadOwners();
  }

  async loadOwners() {
    try {
      this.owners = await this.ownerService.getAll();
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      cpf: '',
      phone: '',
      whatsapp: '',
      email: '',
      notes: ''
    };
  }

  openModal(owner?: Owner) {
    if (owner) {
      this.editingOwner = owner;
      this.formData = { ...owner };
    } else {
      this.editingOwner = null;
      this.resetForm();
    }
    this.showForm = true;
  }

  closeModal() {
    this.showForm = false;
    this.editingOwner = null;
    this.resetForm();
  }

  async saveOwner() {
    try {
      if (this.editingOwner) {
        await this.ownerService.update(this.editingOwner.id, this.formData);
      } else {
        await this.ownerService.create(this.formData);
      }
      this.closeModal();
      await this.loadOwners();
    } catch (error) {
      console.error('Error saving owner:', error);
      alert('Erro ao salvar proprietário');
    }
  }

  async deleteOwner(id: string) {
    if (!this.authService.isAdmin()) {
      alert('Apenas administradores podem excluir proprietários');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este proprietário?')) {
      try {
        await this.ownerService.delete(id);
        await this.loadOwners();
      } catch (error) {
        console.error('Error deleting owner:', error);
        alert('Erro ao excluir proprietário');
      }
    }
  }

  async viewProperties(owner: Owner) {
    this.selectedOwner = owner;
    this.showPropertiesModal = true;
    try {
      this.ownerProperties = await this.propertyService.getByOwner(owner.id);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  closePropertiesModal() {
    this.showPropertiesModal = false;
    this.selectedOwner = null;
    this.ownerProperties = [];
  }

  formatCPF(cpf?: string): string {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
