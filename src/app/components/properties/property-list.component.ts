import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth.service';
import { Property } from '../../models/property.model';
import { Owner } from '../../models/owner.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
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
  documentFiles: { name: string; file: File }[] = [];
  isLoading = false;
  private static readonly CEP_REGEX = /\D/g;

  loadingCep = false;

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
      this.isLoading = true;
      this.properties = await this.propertyService.getAll();
      this.filteredProperties = [...this.properties];
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      this.isLoading = false;
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
      this.isLoading = true;
      this.filteredProperties = await this.propertyService.getFiltered({
        type: this.filterType || undefined,
        city: this.filterCity || undefined,
        sold: this.filterSold !== '' ? this.filterSold === 'true' : undefined,
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
    this.documentFiles = [];
  }

  openModal(property?: Property) {
    if (property) {
      this.editingProperty = property;
      this.formData = {
        ...property,
        totalArea: property.totalArea ?? property.area ?? null,
        builtArea: property.builtArea ?? null
      };
      this.documentFiles = [];
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
      let propertyId: string;
      if (this.formData.totalArea != null && (this.formData.area == null || this.formData.area === 0)) {
        this.formData.area = this.formData.totalArea;
      }
      
      if (this.editingProperty) {
        const updated = await this.propertyService.update(this.editingProperty.id, this.formData);
        propertyId = updated.id;
      } else {
        const created = await this.propertyService.create(this.formData);
        propertyId = created.id;
      }
      
      // Upload documents if any
      if (this.documentFiles.length > 0) {
        const files = this.documentFiles.map(d => d.file);
        const documentUrls = await this.propertyService.uploadDocuments(files, propertyId);
        
        // Merge with existing document URLs
        const allDocumentUrls = [
          ...(this.formData.document_urls || []),
          ...documentUrls
        ];
        
        // Update property with document URLs
        await this.propertyService.update(propertyId, {
          document_urls: allDocumentUrls
        });
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

  async fetchAddressFromCep() {
    const cep = this.formData.zip_code?.replace(PropertyListComponent.CEP_REGEX, '');
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

        await this.geocodeAddress();
      }
    } finally {
      this.loadingCep = false;
    }
  }

  async geocodeAddress() {
    if (!this.formData.city || !this.formData.state) return;

    const cepClean = this.formData.zip_code?.replace(/\D/g, '');

    const strategies = [
      this.formData.street && cepClean
        ? `${this.formData.street}, ${cepClean}, ${this.formData.city}, ${this.formData.state}, Brasil`
        : null,
      this.formData.street
        ? `${this.formData.street}, ${this.formData.city}, ${this.formData.state}, Brasil`
        : null,
      `${this.formData.city}, ${this.formData.state}, Brasil`
    ].filter(Boolean) as string[];

    for (const address of strategies) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`,
          { headers: { 'User-Agent': 'CRM-Imobiliario/1.0' } }
        );
        const data = await res.json();
        if (data?.length) {
          this.formData.latitude = parseFloat(data[0].lat);
          this.formData.longitude = parseFloat(data[0].lon);
          console.log('✓ Coordenadas encontradas:', this.formData.latitude, this.formData.longitude);
          return;
        }
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    }

    console.warn('❌ Geocoding falhou');
  }


  onDocumentSelect(event: any) {
    const files = event.target.files;
    if (!files) return;

    const maxDocuments = 10;
    const totalCurrent = this.getDocumentCount();
    const remainingSlots = maxDocuments - totalCurrent;
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      
      // Validate file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt) {
        console.warn('Arquivo sem extensão ignorado:', file.name);
        continue;
      }
      
      this.documentFiles.push({
        name: file.name,
        file: file
      });
    }

    if (files.length > remainingSlots) {
      alert(`Limite de ${maxDocuments} documentos. Apenas ${filesToAdd} foram adicionados.`);
    }

    event.target.value = '';
  }

  removeDocument(index: number) {
    const existingCount = this.formData.document_urls?.length || 0;
    
    if (index < existingCount) {
      // Remove from existing documents
      this.formData.document_urls.splice(index, 1);
    } else {
      // Remove from new documents
      const newIndex = index - existingCount;
      this.documentFiles.splice(newIndex, 1);
    }
  }

  getDocumentCount(): number {
    const existingDocs = this.formData.document_urls?.length || 0;
    return existingDocs + this.documentFiles.length;
  }

  getDocumentList(): { name: string }[] {
    const existing = (this.formData.document_urls || []).map((url: string) => ({
      name: this.extractFileName(url)
    }));
    return [...existing, ...this.documentFiles];
  }

  extractFileName(url: string): string {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch {
      return 'Documento';
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'txt': return '📃';
      default: return '📎';
    }
  }
}
