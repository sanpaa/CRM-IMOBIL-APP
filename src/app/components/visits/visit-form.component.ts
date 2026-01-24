import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitService } from '../../services/visit.service';
import { ClientService } from '../../services/client.service';
import { OwnerService } from '../../services/owner.service';
import { PropertyService } from '../../services/property.service';
import { SupabaseService } from '../../services/supabase.service';
import { GoogleCalendarService } from 'src/app/services/google-calendar.service';
import { Visit, VisitProperty, VisitEvaluation, InterestLevel } from '../../models/visit.model';
import { Client } from '../../models/client.model';
import { Owner } from '../../models/owner.model';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { PopupService } from '../../shared/services/popup.service';

@Component({
  selector: 'app-visit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="visit-form-modal" *ngIf="isVisible">
      <div class="modal-overlay" (click)="closeForm()"></div>
      <div class="modal-content visit-modal">
        <div class="modal-header">
          <div class="modal-title">
            <h2>Agendamento de Visita</h2>
            <p>Interface de gestão de alto padrão</p>
          </div>
          <button class="close-btn" (click)="closeForm()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <form (ngSubmit)="saveVisit()">
            <div class="visit-summary-grid">
              <div class="summary-card">
                <label>Data selecionada</label>
                <div class="summary-input">
                  <input type="text"
                         [(ngModel)]="dateDisplay"
                         name="visit_date_display"
                         required
                         inputmode="numeric"
                         placeholder="dd/mm/aaaa"
                         (input)="onDateInput($event)"
                         (blur)="onDateBlur()"
                         [class.invalid]="dateInvalid">
                  <i class="bi bi-calendar3"></i>
                </div>
                <small *ngIf="dateInvalid" class="input-hint error">Data invalida</small>
              </div>
              <div class="summary-card">
                <label>Horário premium</label>
                <div class="summary-input">
                  <input type="text"
                         [(ngModel)]="timeDisplay"
                         name="visit_time_display"
                         required
                         inputmode="numeric"
                         placeholder="hh:mm"
                         (input)="onTimeInput($event)"
                         (blur)="onTimeBlur()"
                         [class.invalid]="timeInvalid">
                  <i class="bi bi-clock"></i>
                </div>
                <small *ngIf="timeInvalid" class="input-hint error">Horario invalido</small>
              </div>
              <div class="summary-card">
                <label>Status da jornada</label>
                <select [(ngModel)]="formData.status" name="status" required>
                  <option value="agendada">Agendada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            <div class="section-block">
              <div class="section-title">Membros da visita</div>
              <div class="members-grid">
                <div class="member-card">
                  <div class="member-avatar">
                    {{ getInitials(getClientName()) }}
                  </div>
                  <div class="member-info">
                    <span>Cliente</span>
                    <select [(ngModel)]="formData.client_id" name="client_id" [class.invalid]="fieldErrors.client" (change)="clearFieldError('client')">
                      <option value="">Vincular contato</option>
                      <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
                    </select>
                    <small *ngIf="fieldErrors.client" class="input-hint error">Cliente obrigatório</small>
                  </div>
                </div>
                <div class="member-card">
                  <div class="member-avatar">
                    {{ getInitials(getBrokerName()) }}
                  </div>
                  <div class="member-info">
                    <span>Corretor</span>
                    <select [(ngModel)]="formData.broker_id" name="broker_id" [class.invalid]="fieldErrors.broker" (change)="clearFieldError('broker')">
                      <option value="">Vincular corretor</option>
                      <option *ngFor="let broker of brokers" [value]="broker.id">{{ broker.name || broker.email }}</option>
                    </select>
                    <small *ngIf="fieldErrors.broker" class="input-hint error">Corretor obrigatório</small>
                  </div>
                </div>
                <div class="member-card">
                  <div class="member-avatar dashed">
                    {{ getInitials(getOwnerName()) }}
                  </div>
                  <div class="member-info">
                    <span>Proprietário</span>
                    <select [(ngModel)]="formData.owner_id" name="owner_id">
                      <option value="">Vincular contato</option>
                      <option *ngFor="let owner of owners" [value]="owner.id">{{ owner.name }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Properties Section -->
            <div class="section-block">
              <div class="section-header">
                <div class="section-title">Imóvel selecionado</div>
                <button type="button" (click)="addProperty()" class="btn-link">+ Adicionar imóvel</button>
              </div>

              <div *ngFor="let property of properties; let i = index" class="property-card">
                <div class="property-header">
                  <div>
                    <h4>Imóvel {{ i + 1 }}</h4>
                    <p>Complete os dados do imóvel para a visita</p>
                  </div>
                  <button type="button" (click)="removeProperty(i)" class="btn-remove">Remover</button>
                </div>

                <div class="property-hero">
                  <div class="property-image">
                    <ng-container *ngIf="getPropertyImage(property) as imageUrl; else propertyPlaceholder">
                      <img [src]="imageUrl" alt="Imóvel">
                    </ng-container>
                    <ng-template #propertyPlaceholder>
                      <i class="bi bi-house-door"></i>
                    </ng-template>
                  </div>
                  <div class="property-info">
                    <div class="property-title">{{ property.property_reference || 'Selecione um imóvel' }}</div>
                    <div class="property-address">{{ property.full_address || 'Endereço do imóvel' }}</div>
                    <div class="property-meta">
                      <span><i class="bi bi-house"></i> {{ property.suites || 0 }} Suítes</span>
                      <span><i class="bi bi-car-front"></i> {{ property.parking_spaces || 0 }} Vagas</span>
                      <span><i class="bi bi-rulers"></i> {{ property.total_area || 0 }}m²</span>
                    </div>
                  </div>
                  <div class="property-price">
                    R$ {{ (property.suggested_sale_value || 0) | number:'1.2-2' }}
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Selecionar Imóvel Cadastrado (opcional)</label>
                    <select (change)="onPropertySelect(i, $any($event.target).value)" [name]="'select_prop_' + i" [class.invalid]="fieldErrors.property">
                      <option value="">-- Ou preencher manualmente abaixo --</option>
                      <option *ngFor="let availProp of availableProperties" [value]="availProp.id">
                        {{ availProp.title }} - {{ availProp.city }} (R$ {{ availProp.price | number:'1.2-2' }})
                      </option>
                    </select>
                    <small *ngIf="fieldErrors.property" class="input-hint error">Imóvel obrigatório</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Referência</label>
                    <input type="text" [(ngModel)]="property.property_reference" [name]="'ref_' + i">
                  </div>
                  <div class="form-group">
                    <label>Endereço Completo</label>
                    <input type="text" [(ngModel)]="property.full_address" [name]="'addr_' + i">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Empreendimento</label>
                    <input type="text" [(ngModel)]="property.development" [name]="'dev_' + i">
                  </div>
                  <div class="form-group">
                    <label>Dormitórios</label>
                    <input type="number" [(ngModel)]="property.bedrooms" [name]="'bed_' + i">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Suítes</label>
                    <input type="number" [(ngModel)]="property.suites" [name]="'suite_' + i">
                  </div>
                  <div class="form-group">
                    <label>Banheiros</label>
                    <input type="number" [(ngModel)]="property.bathrooms" [name]="'bath_' + i">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Vagas</label>
                    <input type="number" [(ngModel)]="property.parking_spaces" [name]="'park_' + i">
                  </div>
                  <div class="form-group">
                    <label>Área Total (m²)</label>
                    <input type="text"
                           [(ngModel)]="$any(property).total_area_display"
                           [name]="'area_' + i"
                           inputmode="decimal"
                           placeholder="0,00"
                           (input)="onAreaInput($event, property, 'total_area')">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Área Construída (m²)</label>
                    <input type="text"
                           [(ngModel)]="$any(property).built_area_display"
                           [name]="'built_' + i"
                           inputmode="decimal"
                           placeholder="0,00"
                           (input)="onAreaInput($event, property, 'built_area')">
                  </div>
                  <div class="form-group">
                    <label>Valor Venda Sugerido (R$)</label>
                    <input type="text"
                           [(ngModel)]="$any(property).suggested_sale_value_display"
                           [name]="'value_' + i"
                           inputmode="decimal"
                           placeholder="0,00"
                           (input)="onCurrencyInput($event, property)">
                  </div>
                </div>

                <!-- Evaluations (only for Realizada status) -->
                <div *ngIf="formData.status === 'realizada'" class="evaluation-section">
                  <h4>Avaliação do Cliente</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Estado de Conservação (1-5)</label>
                      <input type="number" [(ngModel)]="getEvaluation(i).conservation_state" 
                             [name]="'cons_' + i" min="1" max="5">
                    </div>
                    <div class="form-group">
                      <label>Localização (1-5)</label>
                      <input type="number" [(ngModel)]="getEvaluation(i).location_rating" 
                             [name]="'loc_' + i" min="1" max="5">
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Valor do Imóvel (1-5)</label>
                      <input type="number" [(ngModel)]="getEvaluation(i).property_value_rating" 
                             [name]="'val_' + i" min="1" max="5">
                    </div>
                    <div class="form-group">
                      <label>Nível de Interesse</label>
                      <select [(ngModel)]="getEvaluation(i).interest_level" [name]="'int_' + i">
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
            <div class="section-block">
              <div class="section-title">Observações estratégicas</div>
              <div class="form-group">
                <textarea [(ngModel)]="formData.notes" name="notes" rows="4"
                          placeholder="Descreva as expectativas e preferências exclusivas do cliente..."></textarea>
              </div>
            </div>

            <div class="form-actions">
              <div class="discard-wrapper">
                <button type="button" (click)="requestDiscard()" class="btn-link danger">Descartar visita</button>
                <div class="discard-confirm" *ngIf="showDiscardConfirm">
                  <span>Descartar alterações?</span>
                  <button type="button" class="btn-link" (click)="showDiscardConfirm = false">Cancelar</button>
                  <button type="button" class="btn-link danger" (click)="confirmDiscard()">Descartar</button>
                </div>
              </div>
              <button type="submit" class="btn-save" [disabled]="saving">
                {{ saving ? 'Salvando...' : 'Agendar Visita' }}
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
      background: var(--color-bg-secondary);
      border-radius: 18px;
      width: 92%;
      max-width: 980px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 1.75rem 2.5rem 1.25rem;
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-bg-secondary);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .modal-title p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 700;
    }

    .close-btn {
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-light);
      font-size: 1rem;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .modal-body {
      padding: 1.5rem 2.5rem 2rem;
      overflow-y: auto;
      flex: 1;
    }

    .visit-summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .summary-card label {
      display: block;
      font-size: 0.7rem;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }

    .summary-card select,
    .summary-card input {
      width: 100%;
      border: none;
      border-bottom: 1px solid var(--color-border-light);
      background: transparent;
      padding: 0.5rem 0;
      font-size: 0.95rem;
      color: var(--color-text-primary);
      font-family: inherit;
    }

    .summary-input {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-bg-tertiary);
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 0.2rem 0.6rem;
    }

    .summary-input i {
      color: var(--color-text-tertiary);
    }

    .summary-card input::placeholder {
      color: var(--color-text-tertiary);
    }

    .summary-card input.invalid {
      border-bottom-color: #ef4444;
      color: #dc2626;
    }

    .input-hint {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
    }

    .input-hint.error {
      color: #dc2626;
    }

    .section-block {
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-text-tertiary);
      margin-bottom: 1rem;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .member-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 14px;
      border: 1px solid var(--color-border-light);
      background: var(--color-bg-secondary);
    }

    .member-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--color-bg-tertiary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--color-text-secondary);
    }

    .member-avatar.dashed {
      border: 2px dashed var(--color-border-light);
      background: transparent;
    }

    .member-info span {
      display: block;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-text-tertiary);
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .member-info select {
      border: none;
      background: transparent;
      font-size: 0.9rem;
      color: var(--color-text-primary);
      font-weight: 600;
      font-family: inherit;
      padding: 0;
    }


    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .btn-link {
      background: transparent;
      border: none;
      color: var(--color-primary);
      font-weight: 600;
      cursor: pointer;
    }

    .property-card {
      background: var(--color-bg-secondary);
      border-radius: 14px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border: 1px solid var(--color-border-light);
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .property-header h4 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 600;
    }

    .property-header p {
      margin: 0.2rem 0 0;
      color: var(--color-text-tertiary);
      font-size: 0.8rem;
    }

    .property-hero {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 1rem;
      align-items: center;
      background: var(--color-bg-tertiary);
      border-radius: 14px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .property-image {
      width: 100px;
      height: 80px;
      border-radius: 12px;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-light);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      font-size: 1.4rem;
      overflow: hidden;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .property-title {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 0.35rem;
    }

    .property-address {
      color: var(--color-text-tertiary);
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .property-meta {
      display: flex;
      gap: 1rem;
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      flex-wrap: wrap;
    }

    .property-price {
      font-weight: 700;
      color: var(--color-primary);
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
      color: var(--color-text-secondary);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.7rem 0.75rem;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-light);
      border-radius: 10px;
      font-size: 0.9rem;
      color: var(--color-text-primary);
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    :host-context(body[data-theme='dark']) .visit-modal select,
    :host-context(body[data-theme='dark']) .visit-modal input {
      color-scheme: dark;
    }

    :host-context(body[data-theme='light']) .visit-modal select,
    :host-context(body[data-theme='light']) .visit-modal input {
      color-scheme: light;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 90px;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
    }

    .form-group select.invalid {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .evaluation-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px dashed var(--color-border-medium);
    }

    .evaluation-section h4 {
      margin: 0 0 1rem 0;
      color: var(--color-text-primary);
      font-size: 0.95rem;
      font-weight: 600;
    }

    .empty-message {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-tertiary);
      font-style: italic;
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
      border-top: 2px solid var(--color-border-light);
    }

    .discard-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-right: auto;
    }

    .discard-confirm {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-light);
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .btn-link.danger {
      color: #ef4444;
    }

    .btn-save {
      background: var(--color-text-primary);
      color: white;
      border: none;
      border-radius: 999px;
      padding: 0.75rem 1.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-body {
        padding: 1rem;
      }

      .visit-summary-grid,
      .members-grid,
      .form-row {
        grid-template-columns: 1fr;
      }

      .property-hero {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VisitFormComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() editingVisit: Visit | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  formData: any = {};
  properties: VisitProperty[] = [];
  evaluations: VisitEvaluation[] = [];
  clients: Client[] = [];
  owners: Owner[] = [];
  brokers: User[] = [];
  availableProperties: Property[] = [];
  saving = false;
  dateDisplay = '';
  timeDisplay = '';
  showDiscardConfirm = false;
  dateInvalid = false;
  timeInvalid = false;
  fieldErrors = {
    client: false,
    broker: false,
    property: false
  };

  constructor(
    private visitService: VisitService,
    private clientService: ClientService,
    private ownerService: OwnerService,
    private propertyService: PropertyService,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private popupService: PopupService,
    private googleCalendarService: GoogleCalendarService
  ) {}

  async ngOnInit() {
    await this.loadClients();
    await this.loadOwners();
    await this.loadBrokers();
    await this.loadAvailableProperties();
    this.resetForm();
  }

  async ngOnChanges(changes: SimpleChanges) {
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

  async loadOwners() {
    try {
      this.owners = await this.ownerService.getAll();
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  }

  async loadBrokers() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const { data: activeData, error: activeError } = await this.supabaseService
        .from('users')
        .select('*')
        .eq('company_id', user.company_id)
        .eq('active', true);

      let brokers = activeData || [];

      if (activeError) {
        const { data: fallbackData, error: fallbackError } = await this.supabaseService
          .from('users')
          .select('*')
          .eq('company_id', user.company_id);

        if (fallbackError) throw fallbackError;
        brokers = fallbackData || [];
      } else if (brokers.length === 0) {
        const { data: fallbackData, error: fallbackError } = await this.supabaseService
          .from('users')
          .select('*')
          .eq('company_id', user.company_id);

        if (fallbackError) throw fallbackError;
        brokers = fallbackData || [];
      }

      if (user && !brokers.find(broker => broker.id === user.id)) {
        brokers = [...brokers, user as User];
      }

      this.brokers = brokers;
    } catch (error) {
      console.error('Error loading brokers:', error);
    }
  }

  async loadAvailableProperties() {
    try {
      this.availableProperties = await this.propertyService.getAll();
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  async loadVisitDetails() {
    if (!this.editingVisit) return;

    try {
      const visitDetails = await this.visitService.getVisitWithDetails(this.editingVisit.id);
      if (visitDetails) {
        this.formData = { ...visitDetails };
        this.properties = (visitDetails.properties || []).map(property => ({
          ...property,
          total_area_display: this.formatAreaDisplay(property.total_area),
          built_area_display: this.formatAreaDisplay(property.built_area),
          suggested_sale_value_display: this.formatCurrencyDisplay(property.suggested_sale_value)
        }) as VisitProperty);
        this.evaluations = visitDetails.evaluations || [];
        this.dateDisplay = this.formatDateDisplay(this.formData.visit_date);
        this.timeDisplay = this.formatTimeDisplay(this.formData.visit_time);
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
    this.dateDisplay = '';
    this.timeDisplay = '';
    this.showDiscardConfirm = false;
    this.dateInvalid = false;
    this.timeInvalid = false;
    this.fieldErrors = { client: false, broker: false, property: false };
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
      suggested_sale_value: undefined,
      total_area_display: '',
      built_area_display: '',
      suggested_sale_value_display: ''
    } as VisitProperty);

    // Add corresponding evaluation placeholder
    this.evaluations.push({
      conservation_state: undefined,
      location_rating: undefined,
      property_value_rating: undefined,
      interest_level: undefined
    });
  }

  onPropertySelect(index: number, propertyId: string) {
    if (index < 0 || index >= this.properties.length) {
      console.error('Invalid property index:', index);
      return;
    }

    const selectedProperty = this.availableProperties.find(p => p.id === propertyId);
    if (selectedProperty && this.properties[index]) {
      // Populate fields from selected property
      this.properties[index].property_reference = selectedProperty.title || '';
      this.properties[index].full_address = this.formatAddress(selectedProperty);
      this.properties[index].bedrooms = selectedProperty.bedrooms;
      this.properties[index].bathrooms = selectedProperty.bathrooms;
      this.properties[index].parking_spaces = selectedProperty.parking;
      this.properties[index].total_area = selectedProperty.area;
      this.properties[index].suggested_sale_value = Number(selectedProperty.price);
      (this.properties[index] as any).property_id = selectedProperty.id;
      if (!this.formData.property_id || index === 0) {
        this.formData.property_id = selectedProperty.id;
      }
      this.fieldErrors.property = false;
      (this.properties[index] as any).image_url = selectedProperty.image_url || selectedProperty.image_urls?.[0] || '';
      (this.properties[index] as any).total_area_display = this.formatAreaDisplay(this.properties[index].total_area);
      (this.properties[index] as any).built_area_display = this.formatAreaDisplay(this.properties[index].built_area);
      (this.properties[index] as any).suggested_sale_value_display = this.formatCurrencyDisplay(this.properties[index].suggested_sale_value);
    }
  }

  formatAddress(property: Property): string {
    const parts = [
      property.street,
      property.neighborhood,
      property.city,
      property.state,
      property.zip_code
    ].filter(part => part != null && part !== '');
    return parts.join(', ');
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
      if (!this.formData.visit_date || !this.formData.visit_time) {
        this.showError('Preencha data e horário da visita.');
        return;
      }
      this.resolvePrimaryPropertyId();
      if (!this.validateRequiredFields()) {
        return;
      }
      // Save or update visit - only send valid Visit table columns
      const visitData: Partial<Visit> = {
        visit_date: this.formData.visit_date,
        visit_time: this.formData.visit_time,
        status: this.formData.status,
        notes: this.formData.notes,
        client_id: this.formData.client_id || null,
        broker_id: this.formData.broker_id || null,
        owner_id: this.formData.owner_id || null,
        property_id: this.formData.property_id || null,
        user_id: this.formData.user_id || null
      };

      let visitId: string;
      let savedVisit: Visit | null = null;
      if (this.editingVisit) {
        const updated = await this.visitService.update(this.editingVisit.id, visitData);
        visitId = updated.id;
        savedVisit = updated;
      } else {
        const created = await this.visitService.create(visitData);
        visitId = created.id;
        savedVisit = created;
      }

      // Save properties
      for (let i = 0; i < this.properties.length; i++) {
        const property = this.properties[i];
        const propertyPayload: VisitProperty = {
          ...property,
          visit_id: visitId
        };
        delete (propertyPayload as any).total_area_display;
        delete (propertyPayload as any).built_area_display;
        delete (propertyPayload as any).suggested_sale_value_display;
        delete (propertyPayload as any).image_url;
        delete (propertyPayload as any).property_id;

        let propertyId: string;
        if (property.id) {
          const updated = await this.visitService.updateVisitProperty(property.id, propertyPayload);
          propertyId = updated.id!;
        } else {
          const created = await this.visitService.addVisitProperty(propertyPayload);
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
            // Only save if there's some meaningful data
            if (evaluation.conservation_state != null || evaluation.location_rating != null || 
                evaluation.property_value_rating != null || evaluation.interest_level != null) {
              await this.visitService.addVisitEvaluation(evaluation);
            }
          }
        }
      }

      if (savedVisit) {
        try {
          if (savedVisit.status === 'cancelada') {
            await this.googleCalendarService.syncVisitFromVisit(savedVisit, {
              title: 'Visita cancelada',
              details: this.buildCancelDetails(savedVisit)
            });
          } else {
            await this.googleCalendarService.syncVisitFromVisit(savedVisit);
          }
        } catch (syncError) {
          console.error('Error syncing visit to Google Calendar:', syncError);
          this.popupService.alert('Visita salva, mas nao foi possivel sincronizar com o Google Agenda.', {
            title: 'Aviso',
            tone: 'warning'
          });
        }
      }

      this.onSave.emit();
      this.closeForm();
    } catch (error) {
      console.error('Error saving visit:', error);
      this.showError('Erro ao salvar visita. Por favor, tente novamente.');
    } finally {
      this.saving = false;
    }
  }

  closeForm() {
    this.isVisible = false;
    this.resetForm();
    this.onClose.emit();
  }

  clearFieldError(field: 'client' | 'broker' | 'property') {
    this.fieldErrors[field] = false;
  }

  requestDiscard() {
    this.showDiscardConfirm = true;
  }

  confirmDiscard() {
    this.showDiscardConfirm = false;
    this.closeForm();
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    this.dateDisplay = formatted;
    input.value = formatted;
    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      this.formData.visit_date = `${year}-${month}-${day}`;
    } else {
      this.formData.visit_date = '';
    }
    this.dateInvalid = false;
  }

  onTimeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    this.timeDisplay = formatted;
    input.value = formatted;
    if (digits.length === 4) {
      this.formData.visit_time = formatted;
    } else {
      this.formData.visit_time = '';
    }
    this.timeInvalid = false;
  }

  onDateBlur() {
    if (!this.dateDisplay) {
      this.dateInvalid = false;
      return;
    }
    this.dateInvalid = !this.isValidDate(this.dateDisplay);
  }

  onTimeBlur() {
    if (!this.timeDisplay) {
      this.timeInvalid = false;
      return;
    }
    this.timeInvalid = !this.isValidTime(this.timeDisplay);
  }

  onCurrencyInput(event: Event, property: VisitProperty) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');
    const numericValue = digits ? Number(digits) / 100 : 0;
    property.suggested_sale_value = numericValue;
    const formatted = this.formatCurrencyDisplay(numericValue);
    (property as any).suggested_sale_value_display = formatted;
    input.value = formatted;
  }

  onAreaInput(event: Event, property: VisitProperty, field: 'total_area' | 'built_area') {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');
    const numericValue = digits ? Number(digits) / 100 : 0;
    (property as any)[field] = numericValue;
    const formatted = this.formatAreaDisplay(numericValue);
    (property as any)[`${field}_display`] = formatted;
    input.value = formatted;
  }

  formatCurrencyDisplay(value?: number): string {
    const numericValue = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  formatAreaDisplay(value?: number): string {
    const numericValue = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  formatDateDisplay(value?: string): string {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  formatTimeDisplay(value?: string): string {
    return value || '';
  }

  getPropertyImage(property: VisitProperty): string | null {
    const direct = (property as any).image_url as string | undefined;
    if (direct) return direct;
    const propertyId = (property as any).property_id as string | undefined;
    if (propertyId) {
      const matchById = this.availableProperties.find(item => item.id === propertyId);
      const byIdUrl = matchById?.image_url || matchById?.image_urls?.[0];
      if (byIdUrl) return byIdUrl;
    }
    if (property.property_reference) {
      const ref = property.property_reference.trim().toLowerCase();
      const matchByTitle = this.availableProperties.find(item =>
        (item.title || '').trim().toLowerCase() === ref
      );
      const byTitleUrl = matchByTitle?.image_url || matchByTitle?.image_urls?.[0];
      if (byTitleUrl) return byTitleUrl;
    }
    return null;
  }

  private resolvePrimaryPropertyId() {
    if (this.formData.property_id) return;
    const firstWithId = this.properties.find(property => (property as any).property_id);
    if (firstWithId) {
      this.formData.property_id = (firstWithId as any).property_id;
    }
  }

  private validateRequiredFields(): boolean {
    const hasClient = !!this.formData.client_id;
    const hasBroker = !!this.formData.broker_id;
    const hasProperty = !!this.formData.property_id;

    this.fieldErrors = {
      client: !hasClient,
      broker: !hasBroker,
      property: !hasProperty
    };

    if (!hasClient || !hasBroker || !hasProperty) {
      this.showError('Preencha cliente, corretor e imóvel antes de salvar.');
      return false;
    }
    return true;
  }

  private isValidDate(value: string): boolean {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12) return false;
    const maxDay = new Date(year, month, 0).getDate();
    return day >= 1 && day <= maxDay;
  }

  private isValidTime(value: string): boolean {
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }

  getInitials(value?: string | null): string {
    if (!value) return '+';
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getClientName(): string {
    const found = this.clients.find(client => client.id === this.formData.client_id);
    return found?.name || 'Cliente';
  }

  getBrokerName(): string {
    const found = this.brokers.find(broker => broker.id === this.formData.broker_id);
    return found?.name || found?.email || 'Corretor';
  }

  getOwnerName(): string {
    const found = this.owners.find(owner => owner.id === this.formData.owner_id);
    return found?.name || 'Proprietário';
  }

  private showError(message: string) {
    this.popupService.alert(message, { title: 'Aviso', tone: 'warning' });
  }

  private buildCancelDetails(visit: Visit): string {
    const lines: string[] = [];
    lines.push('Status: cancelada');
    if (visit.property_id) lines.push(`Imovel: ${visit.property_id}`);
    if (visit.client_id) lines.push(`Cliente: ${visit.client_id}`);
    if (visit.notes) lines.push(`Observacoes: ${visit.notes}`);
    lines.push(`Visita ID: ${visit.id}`);
    return lines.join('\n');
  }
}
