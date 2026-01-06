import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitService } from '../../services/visit.service';
import { ClientService } from '../../services/client.service';
import { SupabaseService } from '../../services/supabase.service';
import { Visit, VisitProperty, VisitEvaluation, InterestLevel } from '../../models/visit.model';
import { Client } from '../../models/client.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-visit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="visit-form-modal" *ngIf="isVisible">
      <div class="modal-overlay" (click)="closeForm()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingVisit ? 'Editar Visita' : 'Nova Visita' }}</h2>
          <button class="close-btn" (click)="closeForm()">&times;</button>
        </div>

        <div class="modal-body">
          <form (ngSubmit)="saveVisit()">
            <!-- Basic Visit Info -->
            <div class="form-section">
              <h3>Informações Básicas</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Data da Visita *</label>
                  <input type="date" [(ngModel)]="formData.visit_date" name="visit_date" required class="form-control">
                </div>
                <div class="form-group">
                  <label>Horário *</label>
                  <input type="time" [(ngModel)]="formData.visit_time" name="visit_time" required class="form-control">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Status *</label>
                  <select [(ngModel)]="formData.status" name="status" class="form-control" required>
                    <option value="agendada">Agendada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Participants -->
            <div class="form-section">
              <h3>Participantes</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Cliente</label>
                  <select [(ngModel)]="formData.client_id" name="client_id" class="form-control">
                    <option value="">Selecione um cliente</option>
                    <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Corretor</label>
                  <select [(ngModel)]="formData.broker_id" name="broker_id" class="form-control">
                    <option value="">Selecione um corretor</option>
                    <option *ngFor="let broker of brokers" [value]="broker.id">{{ broker.name || broker.email }}</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Proprietário</label>
                  <select [(ngModel)]="formData.owner_id" name="owner_id" class="form-control">
                    <option value="">Selecione um proprietário</option>
                    <option *ngFor="let owner of clients" [value]="owner.id">{{ owner.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Properties Section -->
            <div class="form-section">
              <div class="section-header">
                <h3>Imóveis da Visita</h3>
                <button type="button" (click)="addProperty()" class="btn-add">+ Adicionar Imóvel</button>
              </div>

              <div *ngFor="let property of properties; let i = index" class="property-card">
                <div class="property-header">
                  <h4>Imóvel {{ i + 1 }}</h4>
                  <button type="button" (click)="removeProperty(i)" class="btn-remove">Remover</button>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Referência</label>
                    <input type="text" [(ngModel)]="property.property_reference" [name]="'ref_' + i" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Endereço Completo</label>
                    <input type="text" [(ngModel)]="property.full_address" [name]="'addr_' + i" class="form-control">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Empreendimento</label>
                    <input type="text" [(ngModel)]="property.development" [name]="'dev_' + i" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Dormitórios</label>
                    <input type="number" [(ngModel)]="property.bedrooms" [name]="'bed_' + i" class="form-control">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Suítes</label>
                    <input type="number" [(ngModel)]="property.suites" [name]="'suite_' + i" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Banheiros</label>
                    <input type="number" [(ngModel)]="property.bathrooms" [name]="'bath_' + i" class="form-control">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Vagas</label>
                    <input type="number" [(ngModel)]="property.parking_spaces" [name]="'park_' + i" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Área Total (m²)</label>
                    <input type="number" [(ngModel)]="property.total_area" [name]="'area_' + i" class="form-control" step="0.01">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Área Construída (m²)</label>
                    <input type="number" [(ngModel)]="property.built_area" [name]="'built_' + i" class="form-control" step="0.01">
                  </div>
                  <div class="form-group">
                    <label>Valor Venda Sugerido (R$)</label>
                    <input type="number" [(ngModel)]="property.suggested_sale_value" [name]="'value_' + i" class="form-control" step="0.01">
                  </div>
                </div>

                <!-- Evaluations (only for Realizada status) -->
                <div *ngIf="formData.status === 'realizada'" class="evaluation-section">
                  <h4>Avaliação do Cliente</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Estado de Conservação (1-5)</label>
                      <input type="number" [(ngModel)]="getEvaluation(i).conservation_state" 
                             [name]="'cons_' + i" class="form-control" min="1" max="5">
                    </div>
                    <div class="form-group">
                      <label>Localização (1-5)</label>
                      <input type="number" [(ngModel)]="getEvaluation(i).location_rating" 
                             [name]="'loc_' + i" class="form-control" min="1" max="5">
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Valor do Imóvel (1-5)</label>
                      <input type="number" [(ngModel)]="getEvaluation(i).property_value_rating" 
                             [name]="'val_' + i" class="form-control" min="1" max="5">
                    </div>
                    <div class="form-group">
                      <label>Nível de Interesse</label>
                      <select [(ngModel)]="getEvaluation(i).interest_level" [name]="'int_' + i" class="form-control">
                        <option value="">Selecione</option>
                        <option value="DESCARTOU">Descartou</option>
                        <option value="INTERESSOU">Interessou</option>
                        <option value="INTERESSOU_E_ASSINOU_PROPOSTA">Interessou e Assinou Proposta</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="properties.length === 0" class="empty-message">
                Nenhum imóvel adicionado. Clique em "+ Adicionar Imóvel" para começar.
              </div>
            </div>

            <!-- Notes Section -->
            <div class="form-section">
              <h3>Observações</h3>
              <div class="form-group">
                <textarea [(ngModel)]="formData.notes" name="notes" rows="4" class="form-control" 
                          placeholder="Observações adicionais sobre a visita..."></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" (click)="closeForm()" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save" [disabled]="saving">
                {{ saving ? 'Salvando...' : 'Salvar Visita' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visit-form-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
      position: relative;
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      color: white;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .form-section:last-child {
      border-bottom: none;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h3 {
      margin: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
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
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
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

    select.form-control {
      cursor: pointer;
      background-color: white;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .property-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border: 1px solid #e5e7eb;
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .property-header h4 {
      margin: 0;
      color: #1e293b;
      font-size: 1rem;
      font-weight: 600;
    }

    .evaluation-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px dashed #cbd5e1;
    }

    .evaluation-section h4 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .empty-message {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
      font-style: italic;
    }

    .btn-add {
      padding: 0.5rem 1rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-add:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .btn-remove {
      padding: 0.4rem 0.8rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-remove:hover {
      background: #dc2626;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 2px solid #e5e7eb;
    }

    .btn-cancel, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: #64748b;
      color: white;
    }

    .btn-cancel:hover {
      background: #475569;
    }

    .btn-save {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-body {
        padding: 1rem;
      }
    }
  `]
})
export class VisitFormComponent implements OnInit {
  @Input() isVisible = false;
  @Input() editingVisit: Visit | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  formData: any = {};
  properties: VisitProperty[] = [];
  evaluations: VisitEvaluation[] = [];
  clients: Client[] = [];
  brokers: User[] = [];
  saving = false;

  constructor(
    private visitService: VisitService,
    private clientService: ClientService,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadClients();
    await this.loadBrokers();
    this.resetForm();
  }

  async ngOnChanges() {
    if (this.editingVisit && this.isVisible) {
      await this.loadVisitDetails();
    } else if (this.isVisible) {
      this.resetForm();
    }
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getAll();
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async loadBrokers() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const { data, error } = await this.supabaseService
        .from('users')
        .select('*')
        .eq('company_id', user.company_id)
        .eq('active', true);

      if (error) throw error;
      this.brokers = data || [];
    } catch (error) {
      console.error('Error loading brokers:', error);
    }
  }

  async loadVisitDetails() {
    if (!this.editingVisit) return;

    try {
      const visitDetails = await this.visitService.getVisitWithDetails(this.editingVisit.id);
      if (visitDetails) {
        this.formData = { ...visitDetails };
        this.properties = visitDetails.properties || [];
        this.evaluations = visitDetails.evaluations || [];
      }
    } catch (error) {
      console.error('Error loading visit details:', error);
    }
  }

  resetForm() {
    this.formData = {
      visit_date: '',
      visit_time: '',
      status: 'agendada',
      notes: '',
      client_id: '',
      broker_id: '',
      owner_id: ''
    };
    this.properties = [];
    this.evaluations = [];
  }

  addProperty() {
    this.properties.push({
      property_reference: '',
      full_address: '',
      development: '',
      bedrooms: undefined,
      suites: undefined,
      bathrooms: undefined,
      parking_spaces: undefined,
      total_area: undefined,
      built_area: undefined,
      suggested_sale_value: undefined
    });

    // Add corresponding evaluation placeholder
    this.evaluations.push({
      conservation_state: undefined,
      location_rating: undefined,
      property_value_rating: undefined,
      interest_level: undefined
    });
  }

  removeProperty(index: number) {
    this.properties.splice(index, 1);
    this.evaluations.splice(index, 1);
  }

  getEvaluation(index: number): VisitEvaluation {
    if (!this.evaluations[index]) {
      this.evaluations[index] = {
        conservation_state: undefined,
        location_rating: undefined,
        property_value_rating: undefined,
        interest_level: undefined
      };
    }
    return this.evaluations[index];
  }

  async saveVisit() {
    this.saving = true;
    try {
      // Save or update visit
      let visitId: string;
      if (this.editingVisit) {
        const updated = await this.visitService.update(this.editingVisit.id, this.formData);
        visitId = updated.id;
      } else {
        const created = await this.visitService.create(this.formData);
        visitId = created.id;
      }

      // Save properties
      for (let i = 0; i < this.properties.length; i++) {
        const property = this.properties[i];
        property.visit_id = visitId;

        let propertyId: string;
        if (property.id) {
          const updated = await this.visitService.updateVisitProperty(property.id, property);
          propertyId = updated.id!;
        } else {
          const created = await this.visitService.addVisitProperty(property);
          propertyId = created.id!;
        }

        // Save evaluations if status is 'realizada'
        if (this.formData.status === 'realizada' && this.evaluations[i]) {
          const evaluation = this.evaluations[i];
          evaluation.visit_id = visitId;
          evaluation.property_id = propertyId;

          if (evaluation.id) {
            await this.visitService.updateVisitEvaluation(evaluation.id, evaluation);
          } else {
            // Only save if there's some data
            if (evaluation.conservation_state || evaluation.location_rating || 
                evaluation.property_value_rating || evaluation.interest_level) {
              await this.visitService.addVisitEvaluation(evaluation);
            }
          }
        }
      }

      this.onSave.emit();
      this.closeForm();
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Erro ao salvar visita. Por favor, tente novamente.');
    } finally {
      this.saving = false;
    }
  }

  closeForm() {
    this.isVisible = false;
    this.resetForm();
    this.onClose.emit();
  }
}
