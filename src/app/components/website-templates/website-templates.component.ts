import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsiteTemplatesService } from '../../services/website-templates.service';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { AuthService } from '../../services/auth.service';
import { PopupService } from '../../shared/services/popup.service';
import { WebsiteTemplate } from '../../models/website-template.model';

@Component({
  selector: 'app-website-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './website-templates.component.html',
  styleUrls: ['./website-templates.component.scss']
})
export class WebsiteTemplatesComponent implements OnInit {
  templates: WebsiteTemplate[] = [];
  loading = false;
  saving = false;
  showCreateModal = false;
  isAdminUser = false;

  search = '';
  pageTypeFilter = '';

  pageTypes = [
    { value: 'home', label: 'Home Page' },
    { value: 'properties', label: 'Properties Listing' },
    { value: 'property-detail', label: 'Property Detail' },
    { value: 'about', label: 'About Us' },
    { value: 'contact', label: 'Contact' },
    { value: 'custom', label: 'Custom Page' }
  ];

  newTemplate: Partial<WebsiteTemplate> = {
    name: '',
    page_type: 'home',
    html: '',
    css: ''
  };

  constructor(
    private templatesService: WebsiteTemplatesService,
    private customizationService: WebsiteCustomizationService,
    private authService: AuthService,
    private popupService: PopupService
  ) {}

  async ngOnInit() {
    this.isAdminUser = this.authService.isAdmin();
    await this.loadTemplates();
  }

  async loadTemplates() {
    this.loading = true;
    try {
      this.templates = await this.templatesService.getTemplates();
    } catch (error) {
      console.error('Error loading templates:', error);
      this.popupService.alert('Erro ao carregar templates', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.loading = false;
    }
  }

  filteredTemplates(): WebsiteTemplate[] {
    const search = this.search.trim().toLowerCase();
    return this.templates.filter(template => {
      const matchesSearch = !search || template.name.toLowerCase().includes(search);
      const matchesType = !this.pageTypeFilter || template.page_type === this.pageTypeFilter;
      return matchesSearch && matchesType;
    });
  }

  buildPreview(template: WebsiteTemplate): string {
    const html = template.html || '';
    const css = template.css || '';
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;
    const head = `
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
      <style>body{margin:0;font-family:Inter, sans-serif;}${css}</style>
    `;
    return `<!doctype html><html><head>${head}</head><body>${bodyContent}</body></html>`;
  }

  openCreateModal() {
    if (!this.isAdminUser) return;
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  async createTemplate() {
    if (!this.isAdminUser) return;
    if (!this.newTemplate.name || !this.newTemplate.page_type || !this.newTemplate.html) {
      this.popupService.alert('Preencha os campos obrigatorios', { title: 'Aviso', tone: 'warning' });
      return;
    }

    this.saving = true;
    try {
      const created = await this.templatesService.createTemplate({
        name: this.newTemplate.name,
        page_type: this.newTemplate.page_type as any,
        html: this.newTemplate.html,
        css: this.newTemplate.css || '',
        meta_title: this.newTemplate.meta_title,
        meta_description: this.newTemplate.meta_description,
        meta_keywords: this.newTemplate.meta_keywords
      });

      this.templates.unshift(created);
      this.newTemplate = { name: '', page_type: 'home', html: '', css: '' };
      this.showCreateModal = false;
      this.popupService.alert('Template criado com sucesso!', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Error creating template:', error);
      this.popupService.alert('Erro ao criar template', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.saving = false;
    }
  }

  async applyTemplate(template: WebsiteTemplate) {
    const confirmed = await this.popupService.confirm(
      `Aplicar o template "${template.name}"? O layout atual dessa pagina sera substituido.`,
      { title: 'Aplicar template', confirmText: 'Aplicar', cancelText: 'Cancelar', tone: 'warning' }
    );

    if (!confirmed) return;

    const user = this.authService.getCurrentUser();
    if (!user?.company_id) return;

    try {
      const layout = await this.customizationService.createLayout({
        name: template.name,
        page_type: template.page_type as any,
        company_id: user.company_id,
        is_active: true,
        is_default: true,
        layout_config: { pages: [] } as any,
        html: template.html || '',
        css: template.css || '',
        meta_title: template.meta_title,
        meta_description: template.meta_description,
        meta_keywords: template.meta_keywords
      });

      await this.customizationService.setDefaultLayout(layout.id);
      this.popupService.alert('Template aplicado com sucesso!', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Error applying template:', error);
      this.popupService.alert('Erro ao aplicar template', { title: 'Aviso', tone: 'warning' });
    }
  }

  async deleteTemplate(template: WebsiteTemplate) {
    if (!this.isAdminUser) return;
    const confirmed = await this.popupService.confirm(
      `Excluir o template "${template.name}"?`,
      { title: 'Excluir template', confirmText: 'Excluir', cancelText: 'Cancelar', tone: 'danger' }
    );

    if (!confirmed) return;

    try {
      await this.templatesService.deleteTemplate(template.id);
      this.templates = this.templates.filter(item => item.id !== template.id);
      this.popupService.alert('Template excluido com sucesso!', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Error deleting template:', error);
      this.popupService.alert('Erro ao excluir template', { title: 'Aviso', tone: 'warning' });
    }
  }
}
