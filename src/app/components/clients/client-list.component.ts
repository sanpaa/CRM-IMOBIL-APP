import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ClientNoteService } from '../../services/client-note.service';
import { AuthService } from '../../services/auth.service';
import { Client, ClientNote } from '../../models/client.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { PopupService } from '../../shared/services/popup.service';

/**
 * ClientListComponent
 * 
 * Enhanced client management component with advanced features:
 * - Real-time filtering by status and search terms
 * - Immutable notes system with separate modal
 * - CPF field with automatic formatting
 * - Status badges displayed next to client names
 * - Interest field to track client preferences
 * - Role-based delete permissions (admin only)
 * - Modern modal-based forms with smooth animations
 */
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  showForm = false;
  editingClient: Client | null = null;
  formData: any = {};
  isLoading = false;
  
  // Filters
  searchTerm = '';
  filterStatus = '';
  
  // Notes
  selectedClientNotes: ClientNote[] = [];
  showNotesModal = false;
  selectedClient: Client | null = null;
  newNote = '';

  constructor(
    private clientService: ClientService,
    private clientNoteService: ClientNoteService,
    public authService: AuthService,
    private popupService: PopupService
  ) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.isLoading = true;
      this.clients = await this.clientService.getAll();
      this.filteredClients = [...this.clients];
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async applyFilters() {
    try {
      this.isLoading = true;
      this.filteredClients = await this.clientService.getFiltered({
        status: this.filterStatus || undefined,
        searchTerm: this.searchTerm || undefined
      });
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      this.isLoading = false;
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filteredClients = [...this.clients];
  }

  resetForm() {
    this.formData = {
      name: '',
      cpf: '',
      email: '',
      phone: '',
      whatsapp: '',
      origin: '',
      status: 'lead',
      interest: '',
      notes: ''
    };
  }

  openModal(client?: Client) {
    if (client) {
      this.editingClient = client;
      this.formData = { ...client };
    } else {
      this.editingClient = null;
      this.resetForm();
    }
    this.showForm = true;
  }

  closeModal() {
    this.showForm = false;
    this.editingClient = null;
    this.resetForm();
  }

  async saveClient() {
    try {
      if (this.editingClient) {
        await this.clientService.update(this.editingClient.id, this.formData);
      } else {
        await this.clientService.create(this.formData);
      }
      this.closeModal();
      await this.loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      this.popupService.alert('Erro ao salvar cliente', { title: 'Aviso', tone: 'warning' });
    }
  }

  async deleteClient(id: string) {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem excluir clientes', { title: 'Aviso', tone: 'warning' });
      return;
    }
    
    const confirmed = await this.popupService.confirm('Tem certeza que deseja excluir este cliente?', {
      title: 'Excluir cliente',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;
    try {
      await this.clientService.delete(id);
      await this.loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      this.popupService.alert('Erro ao excluir cliente', { title: 'Aviso', tone: 'warning' });
    }
  }

  async openNotesModal(client: Client) {
    this.selectedClient = client;
    this.showNotesModal = true;
    this.newNote = '';
    try {
      this.selectedClientNotes = await this.clientNoteService.getByClientId(client.id);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }

  closeNotesModal() {
    this.showNotesModal = false;
    this.selectedClient = null;
    this.newNote = '';
  }

  async addNote() {
    if (!this.newNote.trim() || !this.selectedClient) return;
    
    try {
      await this.clientNoteService.create(this.selectedClient.id, this.newNote);
      this.newNote = '';
      this.selectedClientNotes = await this.clientNoteService.getByClientId(this.selectedClient.id);
    } catch (error) {
      console.error('Error adding note:', error);
      this.popupService.alert('Erro ao adicionar anotação', { title: 'Aviso', tone: 'warning' });
    }
  }

  getStatusClass(status?: string): string {
    switch(status) {
      case 'lead': return 'status-lead';
      case 'interessado': return 'status-interessado';
      case 'fechamento': return 'status-fechamento';
      case 'cliente': return 'status-cliente';
      default: return 'status-lead';
    }
  }

  getStatusLabel(status?: string): string {
    switch(status) {
      case 'lead': return 'Lead';
      case 'interessado': return 'Interessado';
      case 'fechamento': return 'Fechamento';
      case 'cliente': return 'Cliente';
      default: return 'Lead';
    }
  }

  formatCPF(cpf?: string): string {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
