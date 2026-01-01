import {
  Directive,
  Input,
  ViewContainerRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  ComponentRef
} from '@angular/core';
import { LayoutSection } from '../../models/website-layout.model';
import { ComponentLoaderService } from './component-loader.service';

/**
 * Directive for dynamically rendering website components
 * Usage: <ng-container *appRenderComponent="section; editMode: true"></ng-container>
 */
@Directive({
  selector: '[appRenderComponent]',
  standalone: true
})
export class RenderComponentDirective implements OnInit, OnChanges {
  @Input('appRenderComponent') section!: LayoutSection;
  @Input('appRenderComponentEditMode') editMode: boolean = false;

  private componentRef: ComponentRef<any> | null = null;

  constructor(
    private viewContainer: ViewContainerRef,
    private componentLoader: ComponentLoaderService
  ) {}

  ngOnInit(): void {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && !changes['section'].firstChange) {
      this.loadComponent();
    } else if (changes['editMode'] && !changes['editMode'].firstChange) {
      this.loadComponent();
    }
  }

  private loadComponent(): void {
    if (!this.section) {
      return;
    }

    // Clean up previous component
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }

    // Load the new component
    this.componentRef = this.componentLoader.loadComponent(
      this.viewContainer,
      this.section,
      this.editMode
    );
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
