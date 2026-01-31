import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TemplateDefinition } from '../models/template-definition.model';

export interface TemplateIndexItem {
  id: string;
  name: string;
  preview: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteTemplateService {
  private indexUrl = '/assets/site-templates/index.json';

  constructor(private http: HttpClient) {}

  async getTemplateIndex(): Promise<TemplateIndexItem[]> {
    const data = await firstValueFrom(this.http.get<TemplateIndexItem[]>(this.indexUrl));
    return Array.isArray(data) ? data : [];
  }

  async loadTemplate(templateId: string): Promise<TemplateDefinition> {
    const url = `/assets/site-templates/${templateId}/template.json`;
    return await firstValueFrom(this.http.get<TemplateDefinition>(url));
  }

  async loadBaseCss(templateId: string): Promise<string> {
    const url = `/assets/site-templates/${templateId}/base.css`;
    return await firstValueFrom(this.http.get(url, { responseType: 'text' }));
  }

  async loadBaseHtml(templateId: string): Promise<string> {
    const url = `/assets/site-templates/${templateId}/base.html`;
    return await firstValueFrom(this.http.get(url, { responseType: 'text' }));
  }
}
