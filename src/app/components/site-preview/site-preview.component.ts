import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { SiteRendererComponent } from '../site-renderer/site-renderer.component';
import { SitePreviewStore } from '../../services/site-preview.store';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-site-preview',
  standalone: true,
  imports: [CommonModule, SiteRendererComponent],
  template: `
    <div class="preview-html" *ngIf="previewHtml" [innerHTML]="previewHtml"></div>
    <ng-container *ngIf="!previewHtml && (previewStore.vm$ | async) as vm">
      <app-site-renderer
        *ngIf="vm[0] && vm[1]"
        [template]="vm[0]"
        [config]="vm[1]"
        [properties]="properties"
      ></app-site-renderer>
    </ng-container>
  `
})
export class SitePreviewComponent {
  @Input() properties: Property[] = [];
  @Input() previewHtml: SafeHtml | null = null;

  constructor(public previewStore: SitePreviewStore) {}
}
