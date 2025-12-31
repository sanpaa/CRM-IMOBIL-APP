import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { ComponentLibraryService } from '../../services/component-library.service';
import { AuthService } from '../../services/auth.service';
import { WebsiteLayout, LayoutSection, ComponentType } from '../../models/website-layout.model';

@Component({
  selector: 'app-website-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './website-builder.component.html',
  styleUrls: ['./website-builder.component.scss']
})
export class WebsiteBuilderComponent implements OnInit {
  layouts: WebsiteLayout[] = [];
  currentLayout: WebsiteLayout | null = null;
  sections: LayoutSection[] = [];
  
  availableComponents: any[] = [];
  selectedSection: LayoutSection | null = null;
  
  loading = false;
  saving = false;
  previewMode = false;
  livePreviewEnabled = true;
  previewDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  
  pageTypes = [
    { value: 'home', label: 'Home Page' },
    { value: 'properties', label: 'Properties Listing' },
    { value: 'property-detail', label: 'Property Detail' },
    { value: 'about', label: 'About Us' },
    { value: 'contact', label: 'Contact' },
    { value: 'custom', label: 'Custom Page' }
  ];

  showLayoutForm = false;
  newLayoutData = {
    name: '',
    page_type: 'home' as any,
    slug: ''
  };

  constructor(
    private customizationService: WebsiteCustomizationService,
    private componentLibrary: ComponentLibraryService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      alert('Apenas administradores podem acessar o construtor de sites');
      return;
    }
    
    this.availableComponents = this.componentLibrary.getAvailableComponentTypes();
    await this.loadLayouts();
  }

  async loadLayouts() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user?.company_id) {
        this.layouts = await this.customizationService.getLayouts(user.company_id);
        
        if (this.layouts.length > 0) {
          await this.selectLayout(this.layouts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading layouts:', error);
      alert('Erro ao carregar layouts');
    } finally {
      this.loading = false;
    }
  }

  async selectLayout(layout: WebsiteLayout) {
    this.currentLayout = layout;
    this.sections = [...(layout.layout_config?.sections || [])];
    this.sections.sort((a, b) => a.order - b.order);
    this.selectedSection = null;
  }

  async createNewLayout() {
    if (!this.newLayoutData.name || !this.newLayoutData.page_type) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.saving = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.company_id) return;

      const template = this.customizationService.getDefaultLayoutTemplate(
        this.newLayoutData.page_type,
        user.company_id
      );

      const newLayout = await this.customizationService.createLayout({
        ...template,
        name: this.newLayoutData.name,
        slug: this.newLayoutData.slug || undefined
      });

      this.layouts.unshift(newLayout);
      await this.selectLayout(newLayout);
      
      this.showLayoutForm = false;
      this.newLayoutData = { name: '', page_type: 'home', slug: '' };
      
      alert('Layout criado com sucesso!');
    } catch (error) {
      console.error('Error creating layout:', error);
      alert('Erro ao criar layout');
    } finally {
      this.saving = false;
    }
  }

  /**
   * Generate a unique section ID
   */
  private generateSectionId(): string {
    return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addComponent(componentType: ComponentType) {
    const newSection: LayoutSection = {
      id: this.generateSectionId(),
      type: componentType,
      order: this.sections.length,
      config: this.componentLibrary.getDefaultComponentConfig(componentType).config,
      style: this.componentLibrary.getDefaultComponentConfig(componentType).style_config
    };

    this.sections.push(newSection);
    this.selectedSection = newSection;
  }

  onDrop(event: CdkDragDrop<LayoutSection[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
      this.updateSectionOrder();
    }
  }

  updateSectionOrder() {
    this.sections.forEach((section, index) => {
      section.order = index;
    });
  }

  selectSection(section: LayoutSection) {
    this.selectedSection = section;
  }

  removeSection(section: LayoutSection) {
    const index = this.sections.indexOf(section);
    if (index > -1) {
      this.sections.splice(index, 1);
      this.updateSectionOrder();
      if (this.selectedSection === section) {
        this.selectedSection = null;
      }
    }
  }

  duplicateSection(section: LayoutSection) {
    const duplicate: LayoutSection = {
      ...section,
      id: this.generateSectionId(),
      order: section.order + 1
    };
    
    const index = this.sections.indexOf(section);
    this.sections.splice(index + 1, 0, duplicate);
    this.updateSectionOrder();
  }

  async saveLayout() {
    if (!this.currentLayout) return;

    this.saving = true;
    try {
      const layoutConfig = {
        sections: this.sections
      };

      await this.customizationService.updateLayoutConfig(this.currentLayout.id, layoutConfig);
      alert('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Erro ao salvar layout');
    } finally {
      this.saving = false;
    }
  }

  async publishLayout() {
    if (!this.currentLayout) return;

    if (confirm('Deseja publicar este layout? Ele ficará visível no site.')) {
      try {
        await this.customizationService.setDefaultLayout(this.currentLayout.id);
        alert('Layout publicado com sucesso!');
        await this.loadLayouts();
      } catch (error) {
        console.error('Error publishing layout:', error);
        alert('Erro ao publicar layout');
      }
    }
  }

  async deleteLayout() {
    if (!this.currentLayout) return;

    if (confirm('Tem certeza que deseja excluir este layout?')) {
      try {
        await this.customizationService.deleteLayout(this.currentLayout.id);
        alert('Layout excluído com sucesso!');
        await this.loadLayouts();
      } catch (error) {
        console.error('Error deleting layout:', error);
        alert('Erro ao excluir layout');
      }
    }
  }

  togglePreview() {
    this.previewMode = !this.previewMode;
    this.selectedSection = null;
  }

  toggleLivePreview() {
    this.livePreviewEnabled = !this.livePreviewEnabled;
  }

  setPreviewDevice(device: 'desktop' | 'tablet' | 'mobile') {
    this.previewDevice = device;
  }

  getSectionStyle(section: LayoutSection): any {
    return {
      'background-color': section.style?.backgroundColor || 'transparent',
      'color': section.style?.textColor || 'inherit',
      'padding': section.style?.padding || '2rem',
      'margin': section.style?.margin || '0'
    };
  }

  // Mock properties for preview
  getMockProperties(section: LayoutSection): any[] {
    const config = section.config || {};
    const limit = config.limit || 6;
    
    const mockProps = [
      {
        id: '1',
        title: 'Casa com 3 Quartos',
        city: 'São Paulo',
        state: 'SP',
        price: 450000,
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
        featured: true
      },
      {
        id: '2',
        title: 'Apartamento Moderno',
        city: 'Rio de Janeiro',
        state: 'RJ',
        price: 380000,
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
        featured: true
      },
      {
        id: '3',
        title: 'Casa de Campo',
        city: 'Gramado',
        state: 'RS',
        price: 650000,
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500',
        featured: false
      },
      {
        id: '4',
        title: 'Cobertura Luxo',
        city: 'Belo Horizonte',
        state: 'MG',
        price: 890000,
        bedrooms: 3,
        bathrooms: 3,
        area: 180,
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500',
        featured: true
      },
      {
        id: '5',
        title: 'Studio Compacto',
        city: 'Curitiba',
        state: 'PR',
        price: 220000,
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
        featured: false
      },
      {
        id: '6',
        title: 'Casa em Condomínio',
        city: 'Brasília',
        state: 'DF',
        price: 720000,
        bedrooms: 4,
        bathrooms: 4,
        area: 250,
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
        featured: true
      }
    ];

    let filtered = [...mockProps];
    if (config.showFeatured) {
      filtered = filtered.filter(p => p.featured);
    }
    return filtered.slice(0, limit);
  }

  getComponentIcon(type: ComponentType): string {
    const component = this.availableComponents.find(c => c.type === type);
    return component?.icon || '📦';
  }

  getComponentLabel(type: ComponentType): string {
    const component = this.availableComponents.find(c => c.type === type);
    return component?.label || type;
  }

  updateSectionConfig(section: LayoutSection, configKey: string, value: any) {
    if (!section.config) {
      section.config = {};
    }
    section.config[configKey] = value;
  }

  updateSectionStyle(section: LayoutSection, styleKey: string, value: any) {
    if (!section.style) {
      section.style = {};
    }
    (section.style as any)[styleKey] = value;
  }
}
