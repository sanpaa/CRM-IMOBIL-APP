import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { AuthService } from '../../services/auth.service';
import { WebsiteLayout, LayoutSection, ComponentType } from '../../models/website-layout.model';
import { ComponentRegistryService } from '../../shared/website-components/component-registry.service';
import { RenderComponentDirective } from '../../shared/website-components/render-component.directive';
import { PropertyEditorComponent } from '../../shared/property-editor/property-editor.component';
import { ComponentMetadata } from '../../shared/website-components/component-base.interface';
import { PopupService } from '../../shared/services/popup.service';

@Component({
  selector: 'app-website-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterLink, RenderComponentDirective, PropertyEditorComponent],
  templateUrl: './website-builder.component.html',
  styleUrls: ['./website-builder.component.scss']
})
export class WebsiteBuilderComponent implements OnInit {
  layouts: WebsiteLayout[] = [];
  currentLayout: WebsiteLayout | null = null;
  sections: LayoutSection[] = [];
  
  availableComponents: ComponentMetadata[] = [];
  componentSearch = '';
  zoomLevels = [0.5, 0.75, 1, 1.25];
  zoomLevel = 1;
  hasUnsavedChanges = false;
  autoSaveEnabled = true;
  lastSavedAt: Date | null = null;
  isRestoringHistory = false;
  history: LayoutSection[][] = [];
  historyIndex = -1;
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

  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private historyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private customizationService: WebsiteCustomizationService,
    private componentRegistry: ComponentRegistryService,
    public authService: AuthService,
    private popupService: PopupService
  ) {}

  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      await this.popupService.alert('Apenas administradores podem acessar o construtor de sites', {
        title: 'Aviso',
        tone: 'warning'
      });
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
      this.popupService.alert('Erro ao carregar layouts', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.loading = false;
    }
  }

  async selectLayout(layout: WebsiteLayout) {
    this.currentLayout = layout;
    this.sections = [...(layout.layout_config?.sections || [])];
    this.sections.sort((a, b) => a.order - b.order);
    this.selectedSection = null;
    this.resetHistory();
  }

  async createNewLayout() {
    if (!this.newLayoutData.name || !this.newLayoutData.page_type) {
      this.popupService.alert('Preencha todos os campos obrigatórios', { title: 'Aviso', tone: 'warning' });
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
      
      this.popupService.alert('Layout criado com sucesso!', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Error creating layout:', error);
      this.popupService.alert('Erro ao criar layout', { title: 'Aviso', tone: 'warning' });
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
    this.updateSectionOrder();
    this.recordHistory();
    this.markDirty();
  }



  onDrop(event: CdkDragDrop<any>) {
    // Se veio da biblioteca de componentes, adiciona novo
    if (event.previousContainer.id === 'component-library') {
      const componentMetadata = event.item.data as ComponentMetadata;
      this.addComponent(componentMetadata.type);
      return;
    }

    // Se está movendo dentro da mesma lista
    if (event.previousContainer === event.container) {
      moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
      this.updateSectionOrder();
      this.recordHistory();
      this.markDirty();
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
      this.recordHistory();
      this.markDirty();
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
    this.recordHistory();
    this.markDirty();
  }

  async saveLayout(silent: boolean = false) {
    if (!this.currentLayout) return;

    this.saving = true;
    try {
      const layoutConfig = {
        sections: this.sections
      };

      await this.customizationService.updateLayoutConfig(this.currentLayout.id, layoutConfig);
      this.hasUnsavedChanges = false;
      this.lastSavedAt = new Date();
      if (!silent) {
        this.popupService.alert('Layout salvo com sucesso!', { title: 'Sucesso', tone: 'info' });
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      this.popupService.alert('Erro ao salvar layout', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.saving = false;
    }
  }

  async publishLayout() {
    if (!this.currentLayout) return;

    const confirmed = await this.popupService.confirm('Deseja publicar este layout? Ele ficará visível no site.', {
      title: 'Publicar layout',
      confirmText: 'Publicar',
      cancelText: 'Cancelar',
      tone: 'warning'
    });
    if (!confirmed) return;
    try {
      await this.customizationService.setDefaultLayout(this.currentLayout.id);
      this.popupService.alert('Layout publicado com sucesso!', { title: 'Sucesso', tone: 'info' });
      await this.loadLayouts();
    } catch (error) {
      console.error('Error publishing layout:', error);
      this.popupService.alert('Erro ao publicar layout', { title: 'Aviso', tone: 'warning' });
    }
  }

  async deleteLayout() {
    if (!this.currentLayout) return;

    const confirmed = await this.popupService.confirm('Tem certeza que deseja excluir este layout?', {
      title: 'Excluir layout',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;
    try {
      await this.customizationService.deleteLayout(this.currentLayout.id);
      this.popupService.alert('Layout excluído com sucesso!', { title: 'Sucesso', tone: 'info' });
      await this.loadLayouts();
    } catch (error) {
      console.error('Error deleting layout:', error);
      this.popupService.alert('Erro ao excluir layout', { title: 'Aviso', tone: 'warning' });
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
    this.scheduleHistorySnapshot();
    this.markDirty();
  }

  onStyleChange(style: any): void {
    // Style updated through property editor
    // The section reference is already updated
    this.scheduleHistorySnapshot();
    this.markDirty();
  }

  get filteredComponents(): ComponentMetadata[] {
    const query = this.componentSearch.trim().toLowerCase();
    if (!query) return this.availableComponents;
    return this.availableComponents.filter(component =>
      component.label.toLowerCase().includes(query) ||
      component.type.toLowerCase().includes(query) ||
      (component.description || '').toLowerCase().includes(query)
    );
  }

  setZoom(level: number) {
    this.zoomLevel = level;
  }

  undo() {
    if (this.historyIndex <= 0) return;
    this.restoreHistory(this.historyIndex - 1);
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.restoreHistory(this.historyIndex + 1);
  }

  get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  private markDirty() {
    this.hasUnsavedChanges = true;
    if (this.autoSaveEnabled) {
      this.scheduleAutoSave();
    }
  }

  private scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      if (this.hasUnsavedChanges && !this.saving) {
        this.saveLayout(true);
      }
    }, 800);
  }

  private scheduleHistorySnapshot() {
    if (this.isRestoringHistory) return;
    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
    }
    this.historyTimer = setTimeout(() => {
      this.recordHistory();
    }, 400);
  }

  private recordHistory() {
    if (this.isRestoringHistory) return;
    const snapshot = JSON.parse(JSON.stringify(this.sections)) as LayoutSection[];
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    this.historyIndex = this.history.length - 1;
  }

  private restoreHistory(index: number) {
    const snapshot = this.history[index];
    if (!snapshot) return;
    this.isRestoringHistory = true;
    this.sections = JSON.parse(JSON.stringify(snapshot));
    this.sections.sort((a, b) => a.order - b.order);
    this.selectedSection = null;
    this.historyIndex = index;
    this.isRestoringHistory = false;
  }

  private resetHistory() {
    this.history = [];
    this.historyIndex = -1;
    this.recordHistory();
    this.hasUnsavedChanges = false;
    this.lastSavedAt = null;
  }
}
