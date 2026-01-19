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
        </div>

        <h3 class="section-title">Valores</h3>

        <div class="form-row">
          <div class="form-group">
            <label>Valor *</label>
            <input type="number" [(ngModel)]="formData.price" name="price" class="form-control" required>
          </div>
        </div>

        <h3 class="section-title">Cômodos</h3>

        <div class="form-row">
          <div class="form-group">
            <label>Dormitórios</label>
            <input type="number" [(ngModel)]="formData.bedrooms" name="bedrooms" class="form-control">
          </div>
          <div class="form-group">
            <label>Suítes</label>
            <input type="number" [(ngModel)]="formData.suites" name="suites" class="form-control">
          </div>
          <div class="form-group">
            <label>Banheiros</label>
            <input type="number" [(ngModel)]="formData.bathrooms" name="bathrooms" class="form-control">
          </div>
          <div class="form-group">
            <label>Garagens</label>
            <input type="number" [(ngModel)]="formData.parking" name="parking" class="form-control">
          </div>
          <div class="form-group">
            <label>Cozinhas</label>
            <input type="number" [(ngModel)]="formData.kitchens" name="kitchens" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="formData.diningRoom" name="diningRoom">
              Sala de Jantar
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="formData.livingRoom" name="livingRoom">
              Sala de Estar
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="formData.serviceArea" name="serviceArea">
              Área de Serviço
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="formData.closet" name="closet">
              Closet
            </label>
          </div>
        </div>

        <h3 class="section-title">Medidas</h3>

        <div class="form-row">
          <div class="form-group">
            <label>Área Total (m²)</label>
            <input type="number" [(ngModel)]="formData.totalArea" name="totalArea" class="form-control">
          </div>
          <div class="form-group">
            <label>Área Construída (m²)</label>
            <input type="number" [(ngModel)]="formData.builtArea" name="builtArea" class="form-control">
          </div>
        </div>

        <h3 class="section-title">Endereço</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label>CEP</label>
            <input 
              type="text" 
              [(ngModel)]="formData.zip_code" 
              name="zip_code" 
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
          <label>Imagens (até {{ maxImages }})</label>
          <input 
            type="file" 
            (change)="onImageSelect($event)" 
            class="form-control" 
            accept="image/*" 
            multiple>
          <small class="form-hint">{{ imageUrls.length }}/{{ maxImages }} imagens adicionadas</small>
          <div class="media-preview" *ngIf="imageUrls.length > 0">
            <div *ngFor="let img of imageUrls; let i = index" class="media-item">
              <img [src]="img" alt="Preview">
              <button type="button" (click)="removeImage(i)" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        

        <div class="form-group">
          <label>Documentos (até {{ maxDocuments }})</label>
          <input 
            type="file" 
            (change)="onDocumentSelect($event)" 
            class="form-control" 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            multiple>
          <small class="form-hint">{{ getTotalDocumentCount() }}/{{ maxDocuments }} documentos. Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, TXT</small>
          
          <!-- Existing documents -->
          <div class="document-list" *ngIf="documentUrls.length > 0">
            <div class="document-list-title">Documentos anexados:</div>
            <div *ngFor="let url of documentUrls; let i = index" class="document-item">
              <span class="document-icon">{{ getFileIcon(extractFileName(url) || '') }}</span>
              <span class="document-name">{{ extractFileName(url) || 'Documento ' + (i + 1) }}</span>
              <button type="button" (click)="removeExistingDocument(i)" class="remove-btn-doc">×</button>
            </div>
          </div>
          
          <!-- New documents to upload -->
          <div class="document-list" *ngIf="documentFiles.length > 0">
            <div class="document-list-title" *ngIf="documentUrls.length > 0">Novos documentos:</div>
            <div *ngFor="let doc of documentFiles; let i = index" class="document-item">
              <span class="document-icon">{{ getFileIcon(doc.name) }}</span>
              <span class="document-name">{{ doc.name }}</span>
              <button type="button" (click)="removeDocument(i)" class="remove-btn-doc">×</button>
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
      background: var(--color-bg-secondary);
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid var(--color-border-light);
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

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 600;
      color: #475569;
    }

    .checkbox-group label:hover {
      border-color: #667eea;
      background: #f8f9fa;
    }

    .checkbox-group input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
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

    .media-item img {
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

    .document-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .document-list-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem;
      background: var(--color-bg-tertiary);
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .document-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .document-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .document-name {
      flex: 1;
      color: #475569;
      font-size: 0.9rem;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .remove-btn-doc {
      width: 28px;
      height: 28px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .remove-btn-doc:hover {
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

  private static readonly MAX_IMAGES = 20;
  private static readonly MAX_VIDEOS = 3;
  private static readonly MAX_DOCUMENTS = 10;
  private static readonly CEP_REGEX = /\D/g;

  formData: any = {};
  imageUrls: string[] = [];
  videoUrls: string[] = [];
  documentUrls: string[] = [];
  documentFiles: { name: string; url: string; file: File }[] = [];
  loading = false;
  loadingCep = false;

  ngOnInit() {
    this.resetForm();
    if (this.editingProperty) {
      this.formData = {
        ...this.editingProperty,
        totalArea: this.editingProperty.totalArea ?? this.editingProperty.area ?? null,
        builtArea: this.editingProperty.builtArea ?? null
      };
      this.imageUrls = this.editingProperty.image_urls || [];
      this.documentUrls = this.editingProperty.document_urls || [];
      // Note: existing documents don't have File objects, only URLs
      // They will be displayed but can't be re-uploaded
      // this.videoUrls = this.editingProperty.video_urls || [];
    }
  }

  get maxImages(): number {
    return PropertyFormComponent.MAX_IMAGES;
  }

  get maxVideos(): number {
    return PropertyFormComponent.MAX_VIDEOS;
  }

  get maxDocuments(): number {
    return PropertyFormComponent.MAX_DOCUMENTS;
  }

  resetForm() {
    this.formData = {
      title: '',
      description: '',
      type: 'apartamento',
      price: 0,
      bedrooms: null,
      suites: null,
      bathrooms: null,
      parking: null,
      kitchens: null,
      diningRoom: false,
      livingRoom: false,
      serviceArea: false,
      closet: false,
      totalArea: null,
      builtArea: null,
      area: null,
      zip_code: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      contact: ''
    };
    this.imageUrls = [];
    this.documentUrls = [];
    this.documentFiles = [];
  }

  async fetchAddressFromCep() {
    const cep = this.formData.zip_code?.replace(PropertyFormComponent.CEP_REGEX, '');
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
    if (!this.formData.city || !this.formData.state) {
      return; // Need at least city and state
    }
    
    // Try multiple strategies to find coordinates
    const cepClean = this.formData.zip_code?.replace(/\D/g, '');

    const strategies = [
      // Mais precisa
      this.formData.street && cepClean
        ? `${this.formData.street}, ${cepClean}, ${this.formData.city}, ${this.formData.state}, Brasil`
        : null,

      // Fallback
      this.formData.street
        ? `${this.formData.street}, ${this.formData.city}, ${this.formData.state}, Brasil`
        : null,

      // Último recurso
      `${this.formData.city}, ${this.formData.state}, Brasil`
    ].filter(Boolean);
    
    for (const address of strategies) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address!)}&limit=1&countrycodes=br`,
          {
            headers: {
              'User-Agent': 'CRM-Imobiliario/1.0'
            }
          }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          this.formData.latitude = parseFloat(data[0].lat);
          this.formData.longitude = parseFloat(data[0].lon);
          console.log('✓ Coordenadas encontradas:', {
            lat: this.formData.latitude,
            lon: this.formData.longitude,
            strategy: address
          });
          return; // Success, exit
        }
        
        // Wait a bit between requests to respect Nominatim rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Erro na estratégia:', address, error);
      }
    }
    
    console.warn('⚠ Não foi possível encontrar coordenadas exatas. Usando cidade:', this.formData.city);
  }

  onImageSelect(event: any) {
    const files = event.target.files;
    if (files) {
      const remainingSlots = PropertyFormComponent.MAX_IMAGES - this.imageUrls.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToAdd; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageUrls.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
      
      if (files.length > remainingSlots) {
        alert(`Limite de ${PropertyFormComponent.MAX_IMAGES} imagens. Apenas ${filesToAdd} imagens foram adicionadas.`);
      }
    }
    event.target.value = '';
  }

  removeImage(index: number) {
    this.imageUrls.splice(index, 1);
  }

  onDocumentSelect(event: any) {
    const files = event.target.files;
    if (files) {
      const totalCurrent = this.documentUrls.length + this.documentFiles.length;
      const remainingSlots = PropertyFormComponent.MAX_DOCUMENTS - totalCurrent;
      const filesToAdd = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToAdd; i++) {
        const file = files[i];
        
        // Validate file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt) {
          console.warn('Arquivo sem extensão ignorado:', file.name);
          continue;
        }
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.documentFiles.push({
            name: file.name,
            url: e.target.result,
            file: file
          });
        };
        reader.readAsDataURL(file);
      }
      
      if (files.length > remainingSlots) {
        alert(`Limite de ${PropertyFormComponent.MAX_DOCUMENTS} documentos. Apenas ${filesToAdd} documentos foram adicionados.`);
      }
    }
    event.target.value = '';
  }

  removeDocument(index: number) {
    this.documentFiles.splice(index, 1);
  }

  removeExistingDocument(index: number) {
    this.documentUrls.splice(index, 1);
  }

  getTotalDocumentCount(): number {
    return this.documentUrls.length + this.documentFiles.length;
  }

  extractFileName(url: string): string | null {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch {
      return null;
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  }

  async onSubmit() {
    // Ensure coordinates are set before saving
    if (!this.formData.latitude || !this.formData.longitude) {
      await this.geocodeAddress();
    }
    if (this.formData.totalArea != null && (this.formData.area == null || this.formData.area === 0)) {
      this.formData.area = this.formData.totalArea;
    }
    
    this.formData.image_urls = this.imageUrls;
    this.formData.document_files = this.documentFiles.map(d => d.file);
    this.formData.document_urls = this.documentUrls;
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
