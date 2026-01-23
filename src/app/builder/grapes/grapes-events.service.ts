import { Injectable } from '@angular/core';
import { LayoutConfig, LayoutSection } from '../../models/website-layout.model';
import { GrapesAdapterService } from './grapes-adapter.service';
import { GrapesBlocksRegistry } from './grapes-blocks.registry';

@Injectable({ providedIn: 'root' })
export class GrapesEventsService {
  private updateTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private adapter: GrapesAdapterService,
    private blocksRegistry: GrapesBlocksRegistry
  ) {}

  bind(
    editor: any,
    onLayoutChange: (layoutConfig: LayoutConfig) => void,
    onSelect: (section: LayoutSection | null) => void
  ) {
    const triggerUpdate = () => {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
      this.updateTimer = setTimeout(() => {
        const project = editor.getProjectData();
        const layoutConfig = this.adapter.toLayoutConfig(project);
        onLayoutChange(layoutConfig);
      }, 100);
    };

    const ensureDefaults = (model: any) => {
      if (!model) return;
      const type = model.get?.('type');
      if (!type || !this.blocksRegistry.getSupportedTypes().includes(type)) return;
      const defaults = this.blocksRegistry.getDefaults(type);
      this.adapter.ensureSectionAttributes(model, defaults);
    };

    editor.on('component:add', (model: any) => {
      ensureDefaults(model);
      triggerUpdate();
    });
    editor.on('component:remove', triggerUpdate);
    editor.on('component:update', triggerUpdate);
    editor.on('component:drag:end', triggerUpdate);

    editor.on('component:selected', (model: any) => {
      const resolved = this.resolveSectionModel(model);
      if (!resolved) {
        onSelect(null);
        return;
      }
      const wrapper = editor.DomComponents.getWrapper();
      const order = wrapper?.components?.().indexOf(resolved) ?? 0;
      const section = this.adapter.componentToSection(resolved, order);
      onSelect(section);
    });

    editor.on('component:deselected', () => {
      onSelect(null);
    });
  }

  private resolveSectionModel(model: any): any | null {
    if (!model) return null;
    let current = model;
    while (current) {
      const attrs = current.getAttributes?.() || {};
      if (attrs['data-section-id']) return current;
      current = current.parent?.();
    }
    return null;
  }
}
