import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { GlobalSearchItem, GlobalSearchResults, GlobalSearchService } from '../../services/global-search.service';

interface GlobalSearchGroup {
  key: string;
  label: string;
  icon: string;
  items: GlobalSearchItem[];
}

const EMPTY_RESULTS: GlobalSearchResults = {
  clients: [],
  properties: [],
  deals: [],
  visits: []
};

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="global-search" [class.open]="isOpen" [class.mobile-open]="isMobileOpen">
      <div class="search-input" (click)="$event.stopPropagation()">
        <i class="bi bi-search"></i>
        <input
          #inputRef
          type="text"
          [formControl]="searchControl"
          placeholder="Busque por cliente, imóvel, telefone, código ou endereço…"
          (keydown)="handleKeydown($event)"
          (focus)="openDropdown()"
          role="combobox"
          [attr.aria-expanded]="isOpen"
          aria-autocomplete="list"
          aria-controls="global-search-dropdown"
        />
        <button class="clear-btn" *ngIf="searchControl.value" (click)="clearSearch()" aria-label="Limpar busca">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="mobile-header" *ngIf="isMobileOpen">
        <span>Busca global</span>
        <button class="close-btn" (click)="closeDropdown()" aria-label="Fechar busca">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div
        id="global-search-dropdown"
        class="search-dropdown"
        *ngIf="isOpen"
        (click)="$event.stopPropagation()"
      >
        <ng-container *ngIf="loading">
          <div class="skeleton" *ngFor="let item of skeletonItems"></div>
        </ng-container>

        <ng-container *ngIf="!loading && errorMessage">
          <div class="error-state">
            <p>{{ errorMessage }}</p>
            <button class="retry-btn" (click)="retrySearch()">Tentar novamente</button>
          </div>
        </ng-container>

        <ng-container *ngIf="!loading && hasResults">
          <div class="group" *ngFor="let group of groups">
            <div class="group-title">
              <i class="bi" [class]="'bi ' + group.icon"></i>
              <span>{{ group.label }}</span>
            </div>
            <button
              class="result-item"
              *ngFor="let item of group.items; let idx = index"
              [class.active]="isActiveItem(item)"
              (click)="navigateTo(item)"
              role="option"
            >
              <div class="result-icon">
                <i class="bi" [class]="'bi ' + group.icon"></i>
              </div>
              <div class="result-text">
                <div class="result-title" [innerHTML]="highlight(item.title)"></div>
                <div class="result-subtitle" *ngIf="item.subtitle" [innerHTML]="highlight(item.subtitle)"></div>
              </div>
            </button>
          </div>
        </ng-container>

        <ng-container *ngIf="!loading && !hasResults && searchTerm">
          <div class="empty-state">
            <p>Nenhum resultado encontrado. Deseja cadastrar?</p>
            <button class="cta-btn" (click)="navigateToCreate()">Cadastrar agora</button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .global-search {
      position: relative;
      width: min(520px, 100%);
    }

    .search-input {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 0.9rem;
      background: var(--color-bg-secondary);
      border-radius: 999px;
      border: 1px solid var(--color-border-light);
      box-shadow: var(--shadow-sm);
    }

    .search-input i {
      color: var(--color-text-tertiary);
    }

    .search-input input {
      border: none;
      background: transparent;
      outline: none;
      color: var(--color-text-primary);
      font-size: 0.9rem;
      width: 100%;
    }

    .search-input input::placeholder {
      color: var(--color-text-tertiary);
    }

    .clear-btn {
      border: none;
      background: transparent;
      color: var(--color-text-tertiary);
      cursor: pointer;
      padding: 0.2rem;
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.92);
      color: #E2E8F0;
      border-radius: 16px;
      padding: 0.75rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(148, 163, 184, 0.2);
      backdrop-filter: blur(10px);
      z-index: 2000;
      max-height: 420px;
      overflow-y: auto;
    }

    .group-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(226, 232, 240, 0.7);
      margin: 0.75rem 0 0.4rem;
    }

    .result-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.55rem 0.75rem;
      background: transparent;
      border: none;
      border-radius: 12px;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }

    .result-item:hover,
    .result-item.active {
      background: rgba(148, 163, 184, 0.15);
    }

    .result-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.25);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #BFDBFE;
      flex-shrink: 0;
    }

    .result-title {
      font-weight: 600;
      font-size: 0.92rem;
      color: #F8FAFC;
    }

    .result-subtitle {
      font-size: 0.8rem;
      color: rgba(226, 232, 240, 0.75);
      margin-top: 0.15rem;
    }

    mark {
      background: rgba(59, 130, 246, 0.5);
      color: #E2E8F0;
      border-radius: 4px;
      padding: 0 2px;
    }

    .skeleton {
      height: 52px;
      border-radius: 12px;
      background: linear-gradient(90deg, rgba(148, 163, 184, 0.15) 25%, rgba(148, 163, 184, 0.3) 37%, rgba(148, 163, 184, 0.15) 63%);
      background-size: 400% 100%;
      animation: shimmer 1.4s ease infinite;
      margin-bottom: 0.6rem;
    }

    .empty-state {
      padding: 1rem;
      text-align: center;
      color: rgba(226, 232, 240, 0.8);
    }

    .error-state {
      padding: 1rem;
      text-align: center;
      color: rgba(248, 250, 252, 0.85);
    }

    .retry-btn {
      margin-top: 0.75rem;
      background: #2563EB;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
    }

    .cta-btn {
      margin-top: 0.75rem;
      background: #3B82F6;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
    }

    .mobile-header {
      display: none;
    }

    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }

    @media (max-width: 768px) {
      .search-dropdown {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 0;
        max-height: none;
        padding-top: 4rem;
      }

      .mobile-header {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3.5rem;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
        background: rgba(15, 23, 42, 0.96);
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        z-index: 2100;
      }

      .close-btn {
        background: transparent;
        border: none;
        color: #E2E8F0;
        font-size: 1.1rem;
        cursor: pointer;
      }
    }
  `]
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');
  loading = false;
  isOpen = false;
  isMobileOpen = false;
  searchTerm = '';
  errorMessage = '';
  groups: GlobalSearchGroup[] = [];
  private flatResults: GlobalSearchItem[] = [];
  private activeIndex = -1;
  private lastFailedTerm = '';
  private lastFailedAt = 0;
  private readonly failureCooldownMs = 4000;
  private destroy$ = new Subject<void>();

  skeletonItems = Array.from({ length: 6 });

  constructor(
    private searchService: GlobalSearchService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  get hasResults(): boolean {
    return this.flatResults.length > 0;
  }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      map(value => (value || '').toString()),
      tap(value => {
        this.searchTerm = value.trim();
        this.activeIndex = -1;
        this.errorMessage = '';
        this.openDropdown();
        this.applyCommandHints();
      }),
      debounceTime(300),
      map(value => value.trim()),
      distinctUntilChanged(),
      tap(value => {
        if (!value) {
          this.resetResults();
        }
      }),
      switchMap(value => {
        if (!value) {
          return of(null);
        }
        if (this.isInFailureCooldown(value)) {
          return of(EMPTY_RESULTS);
        }
        this.loading = true;
        return this.searchService.search(value).pipe(
          tap(() => {
            this.errorMessage = '';
          }),
          catchError(() => {
            this.setSearchError(value);
            return of(EMPTY_RESULTS);
          }),
          finalize(() => {
            this.loading = false;
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (!result) {
        this.resetResults();
        return;
      }
      this.setResults(result);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isOpen = false;
    this.isMobileOpen = false;
  }

  openDropdown() {
    if (this.searchTerm.length === 0) {
      return;
    }
    this.isOpen = true;
    this.isMobileOpen = window.innerWidth <= 768;
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.errorMessage = '';
    this.resetResults();
    this.closeDropdown();
    this.inputRef?.nativeElement.focus();
  }

  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      this.openDropdown();
      return;
    }

    if (event.key === 'Escape') {
      this.closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.flatResults.length - 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      return;
    }

    if (event.key === 'Enter') {
      const target = this.flatResults[this.activeIndex] || this.flatResults[0];
      if (target) {
        this.navigateTo(target);
      }
    }
  }

  isActiveItem(item: GlobalSearchItem): boolean {
    return this.flatResults[this.activeIndex]?.id === item.id && this.flatResults[this.activeIndex]?.category === item.category;
  }

  navigateTo(item: GlobalSearchItem) {
    this.closeDropdown();
    if (item.category === 'command') {
      this.executeCommand(item);
      return;
    }
    const route = this.getRouteForItem(item);
    this.router.navigate(route);
  }

  navigateToCreate() {
    this.closeDropdown();
    this.router.navigate(['/clients']);
  }

  retrySearch() {
    const value = (this.searchControl.value || '').toString().trim();
    if (!value) {
      return;
    }
    this.lastFailedAt = 0;
    this.errorMessage = '';
    this.searchControl.setValue(value);
  }

  highlight(text?: string): SafeHtml {
    const safeText = (text ?? '').toString();
    const term = this.searchTerm.trim();
    if (!term) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(safeText));
    }
    const escaped = this.escapeHtml(safeText);
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'ig');
    return this.sanitizer.bypassSecurityTrustHtml(escaped.replace(regex, '<mark>$1</mark>'));
  }

  private setResults(results: GlobalSearchResults) {
    const commandGroup = this.getCommandGroup();
    this.groups = [
      ...(commandGroup ? [commandGroup] : []),
      { key: 'clients', label: 'Clientes', icon: 'bi-people', items: this.normalizeItems(results.clients, 'clients') },
      { key: 'properties', label: 'Imóveis', icon: 'bi-house-door', items: this.normalizeItems(results.properties, 'properties') },
      { key: 'deals', label: 'Negócios', icon: 'bi-briefcase', items: this.normalizeItems(results.deals, 'deals') },
      { key: 'visits', label: 'Visitas', icon: 'bi-calendar-check', items: this.normalizeItems(results.visits, 'visits') }
    ].filter(group => group.items.length > 0);

    this.flatResults = this.groups.flatMap(group => group.items);
  }

  private normalizeItems(items: GlobalSearchItem[], category: GlobalSearchItem['category']): GlobalSearchItem[] {
    return (items || []).map(item => ({
      ...item,
      category,
      title: (item.title || item.subtitle || 'Resultado').toString(),
      subtitle: (item.subtitle || '').toString()
    }));
  }

  private getRouteForItem(item: GlobalSearchItem): string[] {
    switch (item.category) {
      case 'clients':
        return ['/clientes', item.id];
      case 'properties':
        return ['/imoveis', item.id];
      case 'deals':
        return ['/negocios', item.id];
      case 'visits':
        return ['/agenda', item.id];
      default:
        return ['/dashboard'];
    }
  }

  private getCommandGroup(): GlobalSearchGroup | null {
    const command = this.parseCommand(this.searchTerm);
    if (!command) {
      return null;
    }
    return {
      key: 'commands',
      label: 'Comandos',
      icon: 'bi-command',
      items: [command]
    };
  }

  private applyCommandHints() {
    const commandGroup = this.getCommandGroup();
    if (!commandGroup) {
      if (!this.loading && !this.searchTerm) {
        this.resetResults();
      }
      return;
    }
    this.groups = [commandGroup];
    this.flatResults = commandGroup.items;
  }

  private parseCommand(term: string): GlobalSearchItem | null {
    const normalized = term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!normalized) return null;

    if (normalized.startsWith('c ')) {
      const name = normalized.slice(2).trim();
      return {
        id: name || 'novo',
        title: name ? `Criar cliente: ${name}` : 'Criar cliente',
        subtitle: name ? 'Abrir tela de cadastro com nome preenchido' : 'Abrir tela de cadastro',
        category: 'command'
      };
    }

    if (normalized.startsWith('i ')) {
      const ref = normalized.slice(2).trim();
      return {
        id: ref || 'buscar',
        title: ref ? `Abrir imóvel: ${ref}` : 'Abrir imóvel',
        subtitle: ref ? 'Buscar por referência' : 'Abrir lista de imóveis',
        category: 'command'
      };
    }

    if (normalized === 'v hoje' || normalized.startsWith('v ')) {
      return {
        id: 'hoje',
        title: 'Agenda de hoje',
        subtitle: 'Abrir visitas do dia',
        category: 'command'
      };
    }

    if (normalized === 'n') {
      return {
        id: 'novo-negocio',
        title: 'Novo negócio',
        subtitle: 'Abrir criação de negócio',
        category: 'command'
      };
    }

    return null;
  }

  private executeCommand(command: GlobalSearchItem) {
    const normalized = this.searchTerm.toLowerCase().trim();
    if (normalized.startsWith('c ')) {
      const name = this.searchTerm.slice(2).trim();
      this.router.navigate(['/clients'], { queryParams: { create: 'true', name } });
      return;
    }

    if (normalized.startsWith('i ')) {
      const ref = this.searchTerm.slice(2).trim();
      this.router.navigate(['/properties'], { queryParams: { search: ref } });
      return;
    }

    if (normalized.startsWith('v')) {
      this.router.navigate(['/visits'], { queryParams: { date: 'today' } });
      return;
    }

    if (normalized === 'n') {
      this.router.navigate(['/deals'], { queryParams: { create: 'true' } });
    }
  }

  private resetResults() {
    this.groups = [];
    this.flatResults = [];
  }

  private isInFailureCooldown(value: string): boolean {
    if (!this.lastFailedTerm || this.lastFailedTerm !== value) {
      return false;
    }
    return Date.now() - this.lastFailedAt < this.failureCooldownMs;
  }

  private setSearchError(value: string) {
    this.lastFailedTerm = value;
    this.lastFailedAt = Date.now();
    this.errorMessage = 'Serviço de busca indisponível. Tente novamente em instantes.';
    this.groups = [];
    this.flatResults = [];
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
