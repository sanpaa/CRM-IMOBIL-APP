import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ClientNoteService } from '../../services/client-note.service';
import { AuthService } from '../../services/auth.service';
import { Client, ClientNote } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  showForm = false;
  editingClient: Client | null = null;
  formData: any = {};
  
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
    public authService: AuthService
  ) {
    this.resetForm();
  }

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getAll();
      this.filteredClients = [...this.clients];
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async applyFilters() {
    try {
      this.filteredClients = await this.clientService.getFiltered({
        status: this.filterStatus || undefined,
        searchTerm: this.searchTerm || undefined
      });
    } catch (error) {
      console.error('Error applying filters:', error);
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
      alert('Erro ao salvar cliente');
    }
  }

  async deleteClient(id: string) {
    if (!this.authService.isAdmin()) {
      alert('Apenas administradores podem excluir clientes');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await this.clientService.delete(id);
        await this.loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Erro ao excluir cliente');
      }
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
      alert('Erro ao adicionar anotação');
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
