import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Owner } from '../../models/owner.model';
import { Property } from '../../models/property.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { PopupService } from '../../shared/services/popup.service';

@Component({
  selector: 'app-owner-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './owner-list.component.html',
  styleUrls: ['./owner-list.component.scss']
})
export class OwnerListComponent implements OnInit {
  owners: Owner[] = [];
  filteredOwners: Owner[] = [];
  showForm = false;
  editingOwner: Owner | null = null;
  formData: any = {};
  isLoading = false;
  
  // Filters
  searchTerm = '';
  
  // Properties linked to owner
  ownerProperties: Property[] = [];
  showPropertiesModal = false;
  selectedOwner: Owner | null = null;

  constructor(
    private ownerService: OwnerService,
    private propertyService: PropertyService,
    public authService: AuthService,
    private popupService: PopupService
  ) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadOwners();
  }

  async loadOwners() {
    try {
      this.isLoading = true;
      this.owners = await this.ownerService.getAll();
      this.filteredOwners = [...this.owners];
    } catch (error) {
      console.error('Error loading owners:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    if (!this.searchTerm.trim()) {
      this.filteredOwners = [...this.owners];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredOwners = this.owners.filter(owner => 
      owner.name.toLowerCase().includes(term) ||
      owner.email?.toLowerCase().includes(term) ||
      owner.phone?.includes(term) ||
      owner.cpf?.includes(term)
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.filteredOwners = [...this.owners];
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

  onCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    this.formData.cpf = formatted;
    input.value = formatted;
  }

  onPhoneInput(event: Event, field: 'phone' | 'whatsapp') {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      const ddd = digits.slice(0, 2);
      const rest = digits.slice(2);
      if (rest.length > 5) {
        formatted = `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
      } else if (rest.length > 4) {
        formatted = `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
      } else {
        formatted = `(${ddd}) ${rest}`;
      }
    }
    this.formData[field] = formatted;
    input.value = formatted;
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
      this.popupService.alert('Erro ao salvar proprietário', { title: 'Aviso', tone: 'warning' });
    }
  }

  async deleteOwner(id: string) {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem excluir proprietários', { title: 'Aviso', tone: 'warning' });
      return;
    }
    
    const confirmed = await this.popupService.confirm('Tem certeza que deseja excluir este proprietário?', {
      title: 'Excluir proprietário',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;
    try {
      await this.ownerService.delete(id);
      await this.loadOwners();
    } catch (error) {
      console.error('Error deleting owner:', error);
      this.popupService.alert('Erro ao excluir proprietário', { title: 'Aviso', tone: 'warning' });
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
