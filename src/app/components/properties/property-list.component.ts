import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth.service';
import { Property } from '../../models/property.model';
import { Owner } from '../../models/owner.model';
import { PopupService } from '../../shared/services/popup.service';
import { SmartFilterBarComponent } from './ui/smart-filter-bar.component';
import { PropertyRowComponent } from './ui/property-row.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SmartFilterBarComponent, PropertyRowComponent],
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
  priceDisplay = '';
  imageFiles: { name: string; file: File }[] = [];
  isLoading = false;
  private static readonly CEP_REGEX = /\D/g;
  private static readonly MAX_IMAGES = 12;
  skeletonRows = Array.from({ length: 6 });
  readonly pageSize = 10;

  loadingCep = false;

  // Filters
  searchTerm = '';
  filterType = '';
  filterCity = '';
  filterSold = '';

  constructor(
    private propertyService: PropertyService,
    private ownerService: OwnerService,
    public authService: AuthService,
    private popupService: PopupService
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
      areaPrivativa: null,
      areaConstrutiva: null,
      areaTerreno: null,
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      contact: '',
      owner_id: '',
      status: '',
      floor: null,
      furnished: false,
      featured: false,
      sold: false,
      customOptions: [],
      image_urls: []
    };
    this.priceDisplay = this.formatPriceDisplay(0);
    this.imageFiles = [];
  }

  openModal(property?: Property) {
    if (property) {
      this.editingProperty = property;
      this.formData = {
        ...property,
        areaPrivativa: property.areaPrivativa ?? property.totalArea ?? property.area ?? null,
        areaConstrutiva: property.areaConstrutiva ?? property.builtArea ?? null,
        areaTerreno: property.areaTerreno ?? null,
        customOptions: (property as any).custom_options ?? [],
        image_urls: property.image_urls || (property.image_url ? [property.image_url] : [])
      };
      const numericPrice = typeof property.price === 'number' ? property.price : Number(property.price || 0);
      this.formData.price = numericPrice;
      this.priceDisplay = this.formatPriceDisplay(numericPrice);
      this.imageFiles = [];
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

  adjustNumber(field: string, delta: number) {
    const currentValue = Number(this.formData[field] ?? 0);
    const nextValue = Math.max(0, currentValue + delta);
    this.formData[field] = nextValue;
  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');
    const numericValue = digits ? Number(digits) / 100 : 0;
    this.formData.price = numericValue;
    this.priceDisplay = this.formatPriceDisplay(numericValue);
    input.value = this.priceDisplay;
  }

  onCepInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5
      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
      : digits;
    this.formData.zip_code = formatted;
    input.value = formatted;
  }

  onUfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = (input.value || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    this.formData.state = formatted;
    input.value = formatted;
  }

  onContactInput(event: Event) {
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
    this.formData.contact = formatted;
    input.value = formatted;
  }

  private formatPriceDisplay(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  async saveProperty() {
    try {
      let propertyId: string;
      if (Array.isArray(this.formData.customOptions)) {
        const normalizedOptions = this.formData.customOptions
          .map((option: { label?: string; value?: boolean }) => ({
            label: (option.label || '').trim(),
            value: !!option.value
          }))
          .filter((option: { label: string }) => option.label.length > 0);
        this.formData.customOptions = normalizedOptions;
        this.formData.custom_options = normalizedOptions;
      }
      delete this.formData.customOptions;
      
      if (this.editingProperty) {
        const updated = await this.propertyService.update(this.editingProperty.id, this.formData);
        propertyId = updated.id;
      } else {
        const created = await this.propertyService.create(this.formData);
        propertyId = created.id;
      }
      
      // Upload documents if any
      if (this.imageFiles.length > 0) {
        const files = this.imageFiles.map(d => d.file);
        const imageUrls = await this.propertyService.uploadDocuments(files, propertyId);
        
        // Merge with existing image URLs
        const allImageUrls = [
          ...(this.formData.image_urls || []),
          ...imageUrls
        ];
        
        // Update property with image URLs
        await this.propertyService.update(propertyId, {
          image_urls: allImageUrls
        });
      }
      
      this.closeModal();
      await this.loadProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      this.popupService.alert('Erro ao salvar imóvel', { title: 'Aviso', tone: 'warning' });
    }
  }

  async deleteProperty(id: string) {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem excluir imóveis', { title: 'Aviso', tone: 'warning' });
      return;
    }
    
    const confirmed = await this.popupService.confirm('Tem certeza que deseja excluir este imóvel?', {
      title: 'Excluir imóvel',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;
    try {
      await this.propertyService.delete(id);
      await this.loadProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      this.popupService.alert('Erro ao excluir imóvel', { title: 'Aviso', tone: 'warning' });
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


  onImageSelect(event: any) {
    const files = event.target.files;
    if (!files) return;

    const totalCurrent = this.getImageCount();
    const remainingSlots = PropertyListComponent.MAX_IMAGES - totalCurrent;
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      
      if (!file.type?.startsWith('image/')) {
        console.warn('Arquivo não é imagem:', file.name);
        continue;
      }
      
      this.imageFiles.push({
        name: file.name,
        file: file
      });
    }

    if (files.length > remainingSlots) {
      this.popupService.alert(`Limite de ${PropertyListComponent.MAX_IMAGES} imagens. Apenas ${filesToAdd} foram adicionadas.`, {
        title: 'Aviso',
        tone: 'warning'
      });
    }

    event.target.value = '';
  }

  removeImage(index: number) {
    const existingCount = this.formData.image_urls?.length || 0;
    
    if (index < existingCount) {
      // Remove from existing images
      this.formData.image_urls.splice(index, 1);
    } else {
      // Remove from new images
      const newIndex = index - existingCount;
      this.imageFiles.splice(newIndex, 1);
    }
  }

  getImageCount(): number {
    const existingImages = this.formData.image_urls?.length || 0;
    return existingImages + this.imageFiles.length;
  }

  getImageList(): { name: string }[] {
    const existing = (this.formData.image_urls || []).map((url: string) => ({
      name: this.extractFileName(url)
    }));
    return [...existing, ...this.imageFiles];
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
    return '🖼️';
  }

  addCustomOption() {
    if (!this.formData.customOptions) {
      this.formData.customOptions = [];
    }
    this.formData.customOptions.push({ label: '', value: false });
  }

  removeCustomOption(index: number) {
    this.formData.customOptions.splice(index, 1);
  }
}
