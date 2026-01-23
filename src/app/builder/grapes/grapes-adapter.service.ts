import { Injectable } from '@angular/core';
import { LayoutConfig, LayoutSection } from '../../models/website-layout.model';

interface GrapesProjectData {
  pages?: Array<{
    frames?: Array<{
      component?: {
        components?: any[];
      };
    }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class GrapesAdapterService {
  toGrapesProject(layoutConfig: LayoutConfig): GrapesProjectData {
    const sections = [...(layoutConfig.sections || [])].sort((a, b) => a.order - b.order);
    const components = sections.map(section => ({
      type: section.type,
      attributes: {
        'data-section-id': section.id,
        'data-config': JSON.stringify(section.config || {}),
        'data-style': JSON.stringify(section.style || {})
      }
    }));

    return {
      pages: [
        {
          frames: [
            {
              component: {
                components
              }
            }
          ]
        }
      ]
    };
  }

  toLayoutConfig(projectData: GrapesProjectData): LayoutConfig {
    const components = projectData?.pages?.[0]?.frames?.[0]?.component?.components || [];
    const sections: LayoutSection[] = components
      .filter((component: any) => component?.attributes?.['data-section-id'])
      .map((component: any, index: number) => ({
        id: component.attributes['data-section-id'],
        type: component.type,
        order: index,
        config: this.safeParse(component.attributes['data-config']),
        style: this.safeParse(component.attributes['data-style'])
      }));

    return { sections };
  }

  componentToSection(component: any, order: number): LayoutSection | null {
    if (!component || component.get?.('type') === 'wrapper') return null;
    const attrs = component.getAttributes?.() || {};
    const id = attrs['data-section-id'];
    if (!id) return null;

    return {
      id,
      type: component.get('type'),
      order,
      config: this.safeParse(attrs['data-config']),
      style: this.safeParse(attrs['data-style'])
    };
  }

  ensureSectionAttributes(component: any, defaults?: { config?: any; style?: any }) {
    if (!component) return;
    const attrs = component.getAttributes?.() || {};
    const id = attrs['data-section-id'] || this.generateId();
    const config = attrs['data-config'] || JSON.stringify(defaults?.config || {});
    const style = attrs['data-style'] || JSON.stringify(defaults?.style || {});
    component.set('attributes', {
      ...attrs,
      'data-section-id': id,
      'data-config': config,
      'data-style': style
    });
  }

  updateComponentData(component: any, section: LayoutSection, silent: boolean = false) {
    if (!component) return;
    const attrs = component.getAttributes?.() || {};
    const updated = {
      ...attrs,
      'data-section-id': section.id,
      'data-config': JSON.stringify(section.config || {}),
      'data-style': JSON.stringify(section.style || {})
    };
    component.set('attributes', updated, { silent });
  }

  private generateId(): string {
    return `section-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private safeParse(value: any): any {
    if (!value) return {};
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
}
