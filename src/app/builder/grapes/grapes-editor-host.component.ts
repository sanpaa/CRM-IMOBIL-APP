import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import grapesjs from 'grapesjs';
import grapesPresetWebpage from 'grapesjs-preset-webpage';
import grapesBlocksBasic from 'grapesjs-blocks-basic';
import grapesForms from 'grapesjs-plugin-forms';
import grapesNavbar from 'grapesjs-navbar';
import grapesCountdown from 'grapesjs-component-countdown';
import grapesTabs from 'grapesjs-tabs';
import grapesTooltip from 'grapesjs-tooltip';
import grapesCustomCode from 'grapesjs-custom-code';
import { GrapesBlocksRegistry } from './grapes-blocks.registry';

@Component({
  selector: 'app-grapes-editor-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grapes-editor-host.component.html',
  styleUrls: ['./grapes-editor-host.component.scss']
})
export class GrapesEditorHostComponent implements AfterViewInit, OnDestroy {
  @Output() contentChanged = new EventEmitter<void>();

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;

  private editor: any;
  private isLoaded = false;
  private pendingLayout: { html: string; css: string; projectData?: any } | null = null;

  constructor(private blocksRegistry: GrapesBlocksRegistry) { }

  ngAfterViewInit(): void {
    this.initEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  load(json: any) {
    let data: any = json;
    let html = '';
    let css = '';
    let projectData = null;

    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        data = parsed;
      } catch (error) {
        // fallback: treat as raw HTML
        html = data;
        css = '';
        data = null;
      }
    }

    if (data && typeof data === 'object') {
      if (typeof data.html === 'string') {
        html = data.html;
      }
      if (typeof data.css === 'string') {
        css = data.css;
      }
      // Verifica se tem projectData
      if (data.projectData) {
        projectData = data.projectData;
      }
    }

    if (!projectData && typeof html !== 'string') {
      console.error('Grapes load(): formato inválido. Esperado projectData ou html');
      return;
    }

    console.log('[gjs] load() called', {
      isLoaded: this.isLoaded,
      hasProjectData: !!projectData,
      htmlLength: html?.length ?? 0,
      cssLength: css?.length ?? 0
    });

    // Se tiver projectData, preferimos ele
    if (projectData) {
      this.pendingLayout = { html, css, projectData };
    } else {
      this.pendingLayout = { html, css };
    }

    if (this.isLoaded && this.editor) {
      this.applyPendingLayout();
    }
  }

  private applyPendingLayout() {
    if (!this.pendingLayout || !this.editor) return;

    console.log('[gjs] applying layout', { hasProjectData: !!this.pendingLayout.projectData });

    if (this.pendingLayout.projectData) {
      // Carregamento fiel via JSON do projeto
      this.editor.loadProjectData(this.pendingLayout.projectData);

      // Opcionalmente, pode ser necessário forçar refresh
      this.editor.refresh();
    } else {
      // Carregamento legado via HTML/CSS (perda de dados possível)
      this.editor.setComponents(this.pendingLayout.html);
      this.editor.setStyle(this.pendingLayout.css);
      this.editor.refresh();
    }

    // IMPORTANTE: Desbloquear após carregar via applyPendingLayout
    this.unlockAllComponents();

    this.pendingLayout = null;
  }

  save(): any {
    if (!this.editor) return null;

    // Força a limpeza de componentes vazios ou estados temporários
    this.editor.refresh();

    const html = this.editor.getHtml();
    const css = this.editor.getCss({ avoidProtected: true }) || '';
    const projectData = this.editor.getProjectData();

    console.log('[gjs] save() extracting data', {
      htmlLength: html.length,
      cssLength: css.length,
      hasProjectData: !!projectData
    });

    return {
      html,
      css,
      projectData
    };
  }

  getHtml(): string {
    if (!this.editor) return '';
    return this.editor.getHtml();
  }

  getCss(): string {
    if (!this.editor) return '';
    return this.editor.getCss();
  }

  private initEditor() {
    this.editor = grapesjs.init({
      container: this.editorContainer.nativeElement,
      fromElement: false,
      height: '100%',
      width: 'auto',
      storageManager: false,
      plugins: [
        grapesPresetWebpage,
        grapesBlocksBasic,
        grapesForms,
        grapesNavbar,
        grapesCountdown,
        grapesTabs,
        grapesTooltip,
        grapesCustomCode
      ],

      canvas: {
        styles: [
          // Tailwind CDN
          'https://cdn.tailwindcss.com',
          // Component preview styles
          '/assets/website-components.css',
          // Google Fonts
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap',
          // Material Symbols
          'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1'
        ],
        scripts: [
          // Tailwind config (se precisar JS)
          'https://cdn.tailwindcss.com?plugins=forms,container-queries'
        ]
      }
    });


    this.blocksRegistry.registerAll(this.editor);

    this.editor.on('load', () => {
      const openBlocks = this.editor.Panels.getButton('views', 'open-blocks');
      if (openBlocks) {
        openBlocks.set('active', true);
      }
    });

    this.editor.on('canvas:frame:load', () => {
      this.isLoaded = true;
      console.log('[gjs] canvas frame loaded');



      if (this.pendingLayout) {
        // PREVENÇÃO DE LOOP INFINITO:
        // Capturamos o layout e limpamos a flag ANTES de carregar.
        const layoutToLoad = this.pendingLayout;
        this.pendingLayout = null;

        console.log('[gjs] applying pending layout on frame load', {
          htmlLength: layoutToLoad.html?.length ?? 0,
          cssLength: layoutToLoad.css?.length ?? 0,
          hasProjectData: !!layoutToLoad.projectData
        });

        if (layoutToLoad.projectData) {
          try {
            this.editor.loadProjectData(layoutToLoad.projectData);
            this.editor.refresh();
          } catch (e) {
            console.error('[gjs] Error loading project data', e);
            this.editor.setComponents(layoutToLoad.html);
            this.editor.setStyle(layoutToLoad.css);
          }
        } else {
          this.editor.setComponents(layoutToLoad.html);
          this.editor.setStyle(layoutToLoad.css);
          this.editor.refresh();
        }

        // EXECUTA DESBLOQUEIO APÓS CARREGAR TUDO
        // EXECUTA DESBLOQUEIO APÓS CARREGAR TUDO
        this.unlockAllComponents();
      }

      // FIX: Corrige o posicionamento da toolbar flutuante
      this.fixToolbarPositioning();

      // Listener para novos componentes (arrastados do painel)
      this.editor.on('component:add', (component: any) => {
        this.unlockComponent(component);
      });
    });

    this.editor.on('component:update styleManager:change', () => {
      this.contentChanged.emit();
    });
  }

  private fixToolbarPositioning() {
    // Observa mudanças no DOM para detectar quando a toolbar é criada
    const observer = new MutationObserver(() => {
      const toolbar = document.querySelector('.gjs-toolbar') as HTMLElement;
      if (toolbar) {
        // Verifica se a toolbar está com posicionamento negativo (bug)
        const left = parseFloat(toolbar.style.left);
        const top = parseFloat(toolbar.style.top);

        if (left < 0 || top < 0 || isNaN(left) || isNaN(top)) {
          console.log('[gjs] Fixing toolbar position from', { left, top });
          // Reposiciona a toolbar para uma posição visível próxima ao elemento
          toolbar.style.position = 'absolute';
          toolbar.style.left = '50%';
          toolbar.style.top = '50%';
          toolbar.style.transform = 'translate(-50%, -50%)';
          toolbar.style.zIndex = '999999';
        }
      }
    });

    // Observa o container do editor
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }

  private unlockAllComponents() {
    console.log('[gjs] Unlocking all components...');
    this.editor.getComponents().each((cmp: any) => this.unlockComponent(cmp));
  }

  private unlockComponent(component: any) {
    if (!component) return;
    component.set({
      removable: true,
      draggable: true,
      droppable: true,
      badgable: true,
      hoverable: true,
      selectable: true,
      editable: true,
      highlightable: true,
      layerable: true,
      copyable: true
    });
    // Recursivo para filhos
    const children = component.get('components');
    if (children) {
      children.each((child: any) => this.unlockComponent(child));
    }
  }

}
