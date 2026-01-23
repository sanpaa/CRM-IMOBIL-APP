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
  private pendingLayout: { html: string; css: string } | null = null;

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
    }

    if (typeof html !== 'string') {
      console.error('Grapes load(): formato inválido. Esperado { html: string, css: string }');
      return;
    }

    console.log('[gjs] load() called', {
      isLoaded: this.isLoaded,
      htmlLength: html?.length ?? 0,
      cssLength: css?.length ?? 0
    });
    this.pendingLayout = { html, css };

    if (this.isLoaded && this.editor) {
      console.log('[gjs] applying pending layout now');
      this.editor.setComponents(this.pendingLayout.html);
      this.editor.setStyle(this.pendingLayout.css);
      this.editor.refresh();
      this.pendingLayout = null;
    }
  }

  save(): any {
    if (!this.editor) return null;
    return {
      html: this.editor.getHtml(),
      css: this.editor.getCss() || ''
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
      }    });


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
        console.log('[gjs] applying pending layout on frame load', {
          htmlLength: this.pendingLayout.html?.length ?? 0,
          cssLength: this.pendingLayout.css?.length ?? 0
        });
        this.editor.setComponents(this.pendingLayout.html);
        this.editor.setStyle(this.pendingLayout.css);
        this.editor.refresh();
        this.pendingLayout = null;
      }
    });

    this.editor.on('component:update styleManager:change', () => {
      this.contentChanged.emit();
    });
  }


}
