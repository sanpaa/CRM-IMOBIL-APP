import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { AuthService } from '../../services/auth.service';
import { LayoutStorageService } from '../../services/layout-storage.service';
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
    private popupService: PopupService,
    private layoutStorage: LayoutStorageService
  ) { }

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
    this.loading = true;

    try {
      // Carrega conteúdo - do Storage se necessário
      const content = await this.layoutStorage.loadLayoutContent(layout);
      const html = content.html || (layout.layout_config as any)?.html || '';
      const css = content.css || (layout.layout_config as any)?.css || '';
      const projectData = content.projectData;

      console.log('[builder] selectLayout', {
        id: layout.id,
        htmlLength: html?.length ?? 0,
        cssLength: css?.length ?? 0,
        hasProjectData: !!projectData,
        fromStorage: !!(layout.html_url || layout.css_url)
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
          // Rascunhos antigos podem não ter projectData, mas ok
          this.applyLayoutToEditor(draft.html || '', draft.css || '');
        } else {
          this.clearDraft(layout.id);
          this.applyLayoutToEditor(html, css, projectData);
        }
      } else {
        this.applyLayoutToEditor(html, css, projectData);
      }
      this.lastKnownHtml = html || '';
      this.lastKnownCss = css || '';
      this.hasUnsavedChanges = false;
      this.lastSavedAt = null;
    } catch (error) {
      console.error('[builder] Erro ao carregar layout:', error);
      this.popupService.alert('Erro ao carregar o conteúdo do layout', { title: 'Erro', tone: 'warning' });
    } finally {
      this.loading = false;
    }
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
      const data = this.grapesHost?.save() || { html: '', css: '', projectData: null };
      const html = data.html || '';
      const css = data.css || '';
      const projectData = data.projectData;

      // Debug logging
      const htmlSize = new Blob([html]).size;
      const cssSize = new Blob([css]).size;
      console.log('[builder] saveLayout - dados a salvar:', {
        layoutId: this.currentLayout.id,
        htmlSize: `${(htmlSize / 1024).toFixed(2)} KB`,
        cssSize: `${(cssSize / 1024).toFixed(2)} KB`,
        hasProjectData: !!projectData
      });

      if (this.isBlank(html) && this.isBlank(css) && !this.isBlank(this.lastKnownHtml)) {
        console.warn('[builder] blocked empty save');
        this.popupService.alert(
          'O editor retornou HTML/CSS vazios. Bloqueado.',
          { title: 'Salvamento bloqueado', tone: 'warning' }
        );
        return;
      }

      // Usa o LayoutStorageService (agora suporta projectData)
      const storageResult = await this.layoutStorage.saveLayoutContent(
        this.currentLayout.id,
        html,
        css,
        projectData
      );

      console.log('[builder] resultado do storage:', {
        usouStorageHtml: !!storageResult.html_url,
        usouStorageCss: !!storageResult.css_url,
        usouStorageProject: !!(storageResult.project_data && storageResult.project_data.storage_url)
      });

      // Atualiza o layout no banco
      const updatePayload: any = {};

      if (storageResult.html_url) {
        updatePayload.html = '';
        updatePayload.html_url = storageResult.html_url;
      } else {
        updatePayload.html = storageResult.html;
        updatePayload.html_url = null;
      }

      if (storageResult.css_url) {
        updatePayload.css = '';
        updatePayload.css_url = storageResult.css_url;
      } else {
        updatePayload.css = storageResult.css;
        updatePayload.css_url = null;
      }

      // Salva layout_config (Project Data ou Referência Storage)
      if (storageResult.project_data) {
        updatePayload.layout_config = storageResult.project_data;
      }

      console.log('[builder] payload para banco:', {
        htmlInline: !!updatePayload.html,
        htmlUrl: !!updatePayload.html_url,
        cssInline: !!updatePayload.css,
        cssUrl: !!updatePayload.css_url
      });

      await this.customizationService.updateLayout(this.currentLayout.id, updatePayload);

      this.hasUnsavedChanges = false;
      this.lastSavedAt = new Date();
      this.lastKnownHtml = html;
      this.lastKnownCss = css;
      this.clearDraft(this.currentLayout.id);

      if (!silent) {
        const usedStorage = storageResult.html_url || storageResult.css_url;
        this.popupService.alert(
          usedStorage
            ? 'Layout salvo com sucesso! (usando Storage para conteúdo grande)'
            : 'Layout salvo com sucesso!',
          { title: 'Sucesso', tone: 'info' }
        );
      }
    } catch (error: any) {
      console.error('[builder] Error saving layout:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      this.popupService.alert(
        `Erro ao salvar layout: ${error?.message || 'Erro desconhecido'}`,
        { title: 'Erro', tone: 'warning' }
      );
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

  private applyLayoutToEditor(html: string, css: string, projectData?: any) {
    if (this.grapesHost) {
      this.grapesHost.load({ html, css, projectData });
    } else {
      this.pendingProjectData = { html, css, projectData };
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
