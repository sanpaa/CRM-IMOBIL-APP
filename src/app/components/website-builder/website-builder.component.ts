import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { AuthService } from '../../services/auth.service';
import { WebsiteLayout } from '../../models/website-layout.model';
import { PopupService } from '../../shared/services/popup.service';
import { GrapesEditorHostComponent } from '../../builder/grapes/grapes-editor-host.component';

@Component({
  selector: 'app-website-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GrapesEditorHostComponent],
  templateUrl: './website-builder.component.html',
  styleUrls: ['./website-builder.component.scss']
})
export class WebsiteBuilderComponent implements OnInit, AfterViewInit {
  private _grapesHost?: GrapesEditorHostComponent;

  @ViewChild(GrapesEditorHostComponent)
  set grapesHost(host: GrapesEditorHostComponent | undefined) {
    this._grapesHost = host;
    if (host && this.pendingProjectData) {
      console.log('[builder] grapes host ready, loading pending data', {
        htmlLength: this.pendingProjectData.html?.length ?? 0,
        cssLength: this.pendingProjectData.css?.length ?? 0
      });
      host.load(this.pendingProjectData);
      this.pendingProjectData = null;
    }
  }

  get grapesHost(): GrapesEditorHostComponent | undefined {
    return this._grapesHost;
  }
  layouts: WebsiteLayout[] = [];
  currentLayout: WebsiteLayout | null = null;
  
  hasUnsavedChanges = false;
  autoSaveEnabled = true;
  lastSavedAt: Date | null = null;
  
  loading = false;
  saving = false;

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
  private pendingProjectData: any = null;
  private draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private lastKnownHtml = '';
  private lastKnownCss = '';

  constructor(
    private customizationService: WebsiteCustomizationService,
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
    
    await this.loadLayouts();
  }

  ngAfterViewInit(): void {
    if (this.pendingProjectData) {
      this.grapesHost?.load(this.pendingProjectData);
      this.pendingProjectData = null;
    }
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
    const html = layout.html ?? (layout.layout_config as any)?.html ?? '';
    const css = layout.css ?? (layout.layout_config as any)?.css ?? '';
    console.log('[builder] selectLayout', {
      id: layout.id,
      htmlLength: html?.length ?? 0,
      cssLength: css?.length ?? 0
    });
    const draft = this.getDraft(layout.id);
    const shouldRestoreDraft = this.shouldRestoreDraft(layout, draft);
    if (draft && shouldRestoreDraft) {
      const confirmed = await this.popupService.confirm(
        'Encontramos um rascunho local mais recente para este layout. Deseja restaurar?',
        {
          title: 'Restaurar rascunho',
          confirmText: 'Restaurar',
          cancelText: 'Descartar',
          tone: 'warning'
        }
      );
      if (confirmed) {
        this.applyLayoutToEditor(draft.html || '', draft.css || '');
      } else {
        this.clearDraft(layout.id);
        this.applyLayoutToEditor(html, css);
      }
    } else {
      this.applyLayoutToEditor(html, css);
    }
    this.lastKnownHtml = html || '';
    this.lastKnownCss = css || '';
    this.hasUnsavedChanges = false;
    this.lastSavedAt = null;
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
      const emptyProjectData = { pages: [] } as any;

      const newLayout = await this.customizationService.createLayout({
        ...template,
        layout_config: emptyProjectData,
        html: '',
        css: '',
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

  async saveLayout(silent: boolean = false) {
    if (!this.currentLayout) return;

    this.saving = true;
    try {
      const data = this.grapesHost?.save() || { html: '', css: '' };
      if (this.isBlank(data.html) && this.isBlank(data.css) && !this.isBlank(this.lastKnownHtml)) {
        console.warn('[builder] blocked empty save');
        this.popupService.alert(
          'O editor retornou HTML/CSS vazios. Para evitar perda, o salvamento foi bloqueado.',
          { title: 'Salvamento bloqueado', tone: 'warning' }
        );
        return;
      }
      await this.customizationService.updateLayout(this.currentLayout.id, {
        html: data.html || '',
        css: data.css || ''
      } as any);
      this.hasUnsavedChanges = false;
      this.lastSavedAt = new Date();
      this.lastKnownHtml = data.html || '';
      this.lastKnownCss = data.css || '';
      this.clearDraft(this.currentLayout.id);
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

  onEditorChange(): void {
    this.hasUnsavedChanges = true;
    this.scheduleDraftSave();
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

  private applyLayoutToEditor(html: string, css: string) {
    if (this.grapesHost) {
      this.grapesHost.load({ html, css });
    } else {
      this.pendingProjectData = { html, css };
    }
  }

  private scheduleDraftSave() {
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
    }
    this.draftSaveTimer = setTimeout(() => {
      if (!this.currentLayout) return;
      const html = this.grapesHost?.getHtml() || '';
      const css = this.grapesHost?.getCss() || '';
      if (this.isBlank(html) && this.isBlank(css)) return;
      this.saveDraft(this.currentLayout.id, html, css);
    }, 600);
  }

  private saveDraft(layoutId: string, html: string, css: string) {
    try {
      const payload = {
        html,
        css,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.getDraftKey(layoutId), JSON.stringify(payload));
    } catch (error) {
      console.warn('[builder] failed to save draft', error);
    }
  }

  private getDraft(layoutId: string): { html: string; css: string; updatedAt: string } | null {
    try {
      const raw = localStorage.getItem(this.getDraftKey(layoutId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        html: typeof parsed.html === 'string' ? parsed.html : '',
        css: typeof parsed.css === 'string' ? parsed.css : '',
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : ''
      };
    } catch (error) {
      console.warn('[builder] failed to read draft', error);
      return null;
    }
  }

  private clearDraft(layoutId: string) {
    try {
      localStorage.removeItem(this.getDraftKey(layoutId));
    } catch (error) {
      console.warn('[builder] failed to clear draft', error);
    }
  }

  private getDraftKey(layoutId: string) {
    return `website-builder:draft:${layoutId}`;
  }

  private shouldRestoreDraft(layout: WebsiteLayout, draft: { updatedAt: string } | null): boolean {
    if (!draft?.updatedAt) return false;
    const draftTime = Date.parse(draft.updatedAt);
    const layoutTime = Date.parse(layout.updated_at);
    if (Number.isNaN(draftTime)) return false;
    if (Number.isNaN(layoutTime)) return true;
    return draftTime > layoutTime;
  }

  private isBlank(value?: string | null): boolean {
    return !value || value.trim().length === 0;
  }
}
