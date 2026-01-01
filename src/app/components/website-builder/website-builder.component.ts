import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { AuthService } from '../../services/auth.service';
import { WebsiteLayout, LayoutSection, ComponentType } from '../../models/website-layout.model';
import { ComponentRegistryService } from '../../shared/website-components/component-registry.service';
import { RenderComponentDirective } from '../../shared/website-components/render-component.directive';
import { PropertyEditorComponent } from '../../shared/property-editor/property-editor.component';
import { ComponentMetadata } from '../../shared/website-components/component-base.interface';

@Component({
  selector: 'app-website-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RenderComponentDirective, PropertyEditorComponent],
  templateUrl: './website-builder.component.html',
  styleUrls: ['./website-builder.component.scss']
})
export class WebsiteBuilderComponent implements OnInit {
  layouts: WebsiteLayout[] = [];
  currentLayout: WebsiteLayout | null = null;
  sections: LayoutSection[] = [];
  
  availableComponents: ComponentMetadata[] = [];
  selectedSection: LayoutSection | null = null;
  
  loading = false;
  saving = false;
  previewMode = false;
  livePreviewEnabled = true;
  fullScreenPreview = false;
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
    private componentRegistry: ComponentRegistryService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      alert('Apenas administradores podem acessar o construtor de sites');
      return;
    }
    
    this.availableComponents = this.componentRegistry.getAllMetadata();
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

  addComponent(componentType: string) {
    const metadata = this.componentRegistry.getMetadata(componentType);
    if (!metadata) {
      console.error(`Component metadata not found for type: ${componentType}`);
      return;
    }

    const newSection: LayoutSection = {
      id: this.generateSectionId(),
      type: componentType as ComponentType,
      order: this.sections.length,
      config: { ...metadata.defaultConfig },
      style: metadata.defaultStyle ? { ...metadata.defaultStyle } : undefined
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

  toggleFullScreenPreview() {
    this.fullScreenPreview = !this.fullScreenPreview;
  }

  setPreviewDevice(device: 'desktop' | 'tablet' | 'mobile') {
    this.previewDevice = device;
  }

  getComponentIcon(type: ComponentType): string {
    const metadata = this.componentRegistry.getMetadata(type);
    return metadata?.icon || '📦';
  }

  getComponentLabel(type: ComponentType): string {
    const metadata = this.componentRegistry.getMetadata(type);
    return metadata?.label || type;
  }

  onConfigChange(config: any): void {
    // Config updated through property editor
    // The section reference is already updated
  }

  onStyleChange(style: any): void {
    // Style updated through property editor
    // The section reference is already updated
  }
}
