import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { TemplateDefinition } from '../models/template-definition.model';
import { SiteConfig } from '../models/site-config.model';

@Injectable({
  providedIn: 'root'
})
export class SitePreviewStore {
  readonly template$ = new BehaviorSubject<TemplateDefinition | null>(null);
  readonly config$ = new BehaviorSubject<SiteConfig | null>(null);

  readonly vm$ = combineLatest([this.template$, this.config$]);

  setTemplate(template: TemplateDefinition | null) {
    this.template$.next(template);
  }

  setConfig(config: SiteConfig | null) {
    this.config$.next(config);
  }
}
