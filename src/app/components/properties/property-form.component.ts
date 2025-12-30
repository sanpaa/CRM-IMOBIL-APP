import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-card">
      <h2>{{ editingProperty ? 'Editar Imóvel' : 'Novo Imóvel' }}</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Título *</label>
          <input type="text" [(ngModel)]="formData.title" name="title" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label>Descrição *</label>
          <textarea [(ngModel)]="formData.description" name="description" class="form-control" rows="3" required></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tipo *</label>
            <select [(ngModel)]="formData.type" name="type" class="form-control" required>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
          <div class="form-group">
            <label>Preço *</label>
            <input type="number" [(ngModel)]="formData.price" name="price" class="form-control" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Quartos</label>
            <input type="number" [(ngModel)]="formData.bedrooms" name="bedrooms" class="form-control">
          </div>
          <div class="form-group">
            <label>Banheiros</label>
            <input type="number" [(ngModel)]="formData.bathrooms" name="bathrooms" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Área (m²)</label>
            <input type="number" [(ngModel)]="formData.area" name="area" class="form-control">
          </div>
          <div class="form-group">
            <label>Vagas</label>
            <input type="number" [(ngModel)]="formData.parking" name="parking" class="form-control">
          </div>
        </div>

        <h3 class="section-title">Endereço</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label>CEP</label>
            <input 
              type="text" 
              [(ngModel)]="formData.cep" 
              name="cep" 
              class="form-control"
              (blur)="fetchAddressFromCep()"
              placeholder="00000-000"
              maxlength="9">
            <small class="form-hint" *ngIf="loadingCep">Buscando endereço...</small>
          </div>
          <div class="form-group">
            <label>Rua</label>
            <input type="text" [(ngModel)]="formData.street" name="street" class="form-control">
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
            <label>Estado</label>
            <input type="text" [(ngModel)]="formData.state" name="state" class="form-control" maxlength="2">
          </div>
          <div class="form-group">
            <label>Contato *</label>
            <input type="text" [(ngModel)]="formData.contact" name="contact" class="form-control" required>
          </div>
        </div>

        <h3 class="section-title">Mídia</h3>
        
        <div class="form-group">
          <label>Imagens (até 20)</label>
          <input 
            type="file" 
            (change)="onImageSelect($event)" 
            class="form-control" 
            accept="image/*" 
            multiple>
          <small class="form-hint">{{ imageUrls.length }}/20 imagens adicionadas</small>
          <div class="media-preview" *ngIf="imageUrls.length > 0">
            <div *ngFor="let img of imageUrls; let i = index" class="media-item">
              <img [src]="img" alt="Preview">
              <button type="button" (click)="removeImage(i)" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Vídeos (até 3)</label>
          <input 
            type="file" 
            (change)="onVideoSelect($event)" 
            class="form-control" 
            accept="video/*" 
            multiple>
          <small class="form-hint">{{ videoUrls.length }}/3 vídeos adicionados</small>
          <div class="media-preview" *ngIf="videoUrls.length > 0">
            <div *ngFor="let video of videoUrls; let i = index" class="media-item">
              <video [src]="video" controls></video>
              <button type="button" (click)="removeVideo(i)" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" (click)="onCancel()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card {
      background: white;
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

    .section-title {
      margin: 2rem 0 1rem 0;
      color: #1e293b;
      font-size: 1.2rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
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
      margin-bottom: 1.5rem;
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

    .form-hint {
      margin-top: 0.25rem;
      color: #64748b;
      font-size: 0.85rem;
    }

    .media-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .media-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e5e7eb;
    }

    .media-item img,
    .media-item video {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 30px;
      height: 30px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .remove-btn:hover {
      background: #dc2626;
      transform: scale(1.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #e5e7eb;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #cbd5e1;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class PropertyFormComponent implements OnInit {
  @Input() editingProperty: Property | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formData: any = {};
  imageUrls: string[] = [];
  videoUrls: string[] = [];
  loading = false;
  loadingCep = false;

  ngOnInit() {
    this.resetForm();
    if (this.editingProperty) {
      this.formData = { ...this.editingProperty };
      this.imageUrls = this.editingProperty.image_urls || [];
      this.videoUrls = this.editingProperty.video_urls || [];
    }
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
      cep: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      contact: ''
    };
    this.imageUrls = [];
    this.videoUrls = [];
  }

  async fetchAddressFromCep() {
    const cep = this.formData.cep?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    this.loadingCep = true;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        this.formData.street = data.logradouro || this.formData.street;
        this.formData.neighborhood = data.bairro || this.formData.neighborhood;
        this.formData.city = data.localidade || this.formData.city;
        this.formData.state = data.uf || this.formData.state;
        
        // Try to get coordinates from the address
        await this.geocodeAddress();
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    } finally {
      this.loadingCep = false;
    }
  }

  async geocodeAddress() {
    const address = `${this.formData.street}, ${this.formData.city}, ${this.formData.state}, Brazil`;
    try {
      // Using OpenStreetMap Nominatim (free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        this.formData.latitude = parseFloat(data[0].lat);
        this.formData.longitude = parseFloat(data[0].lon);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  }

  onImageSelect(event: any) {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 20 - this.imageUrls.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToAdd; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageUrls.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
      
      if (files.length > remainingSlots) {
        alert(`Limite de 20 imagens. Apenas ${filesToAdd} imagens foram adicionadas.`);
      }
    }
    event.target.value = '';
  }

  onVideoSelect(event: any) {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 3 - this.videoUrls.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToAdd; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.videoUrls.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
      
      if (files.length > remainingSlots) {
        alert(`Limite de 3 vídeos. Apenas ${filesToAdd} vídeos foram adicionados.`);
      }
    }
    event.target.value = '';
  }

  removeImage(index: number) {
    this.imageUrls.splice(index, 1);
  }

  removeVideo(index: number) {
    this.videoUrls.splice(index, 1);
  }

  onSubmit() {
    this.formData.image_urls = this.imageUrls;
    this.formData.video_urls = this.videoUrls;
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
