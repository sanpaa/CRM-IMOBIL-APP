import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-smart-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="smart-filter-bar">
      <div class="smart-search">
        <span class="material-symbols-outlined">search</span>
        <input
          type="text"
          [ngModel]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
          (keyup.enter)="apply.emit()"
          placeholder="Buscar por título, endereço, bairro..."
        />
      </div>

      <div class="smart-selects">
        <div class="smart-select">
          <select [ngModel]="filterType" (ngModelChange)="onTypeChange($event)">
            <option value="">Todos Tipos</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
          </select>
          <span class="material-symbols-outlined">expand_more</span>
        </div>

        <div class="smart-select">
          <select [ngModel]="filterCity" (ngModelChange)="onCityChange($event)">
            <option value="">Todas Cidades</option>
          </select>
          <span class="material-symbols-outlined">location_on</span>
        </div>

        <div class="smart-select">
          <select [ngModel]="filterSold" (ngModelChange)="onStatusChange($event)">
            <option value="">Status</option>
            <option value="false">Disponível</option>
            <option value="true">Vendido</option>
          </select>
          <span class="material-symbols-outlined">analytics</span>
        </div>

        <button type="button" class="smart-advanced" (click)="toggleAdvanced()">
          <span class="material-symbols-outlined">tune</span>
          Filtros Avançados
        </button>
      </div>
    </div>

    <div class="advanced-drawer" [class.open]="advancedOpen">
      <div class="advanced-backdrop" (click)="toggleAdvanced()"></div>
      <aside class="advanced-panel">
        <header>
          <h3>Filtros Avançados</h3>
          <button type="button" (click)="toggleAdvanced()">✕</button>
        </header>
        <div class="advanced-body">
          <p>Em breve: filtros por faixa de preço, área, quartos e destaque.</p>
        </div>
        <footer>
          <button type="button" class="ghost" (click)="clear.emit(); toggleAdvanced()">Limpar filtros</button>
          <button type="button" class="primary" (click)="apply.emit(); toggleAdvanced()">Aplicar</button>
        </footer>
      </aside>
    </div>
  `,
  styles: [`
    .smart-filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      border-radius: 18px;
      background: #0f172a;
      border: 1px solid #1e293b;
      box-shadow: 0 12px 30px rgba(2, 6, 23, 0.45);
    }

    .smart-search {
      flex: 1 1 320px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #0b1220;
      border-radius: 12px;
      padding: 0 1rem;
    }

    .smart-search input {
      flex: 1;
      background: transparent;
      border: none;
      color: #e2e8f0;
      padding: 0.75rem 0;
      font-size: 0.9rem;
    }

    .smart-search input:focus {
      outline: none;
    }

    .smart-search .material-symbols-outlined {
      color: #94a3b8;
      font-size: 20px;
    }

    .smart-selects {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .smart-select {
      position: relative;
    }

    .smart-select select {
      appearance: none;
      min-width: 140px;
      padding: 0.65rem 2.2rem 0.65rem 1rem;
      border-radius: 12px;
      border: none;
      background: #0b1220;
      color: #e2e8f0;
      font-size: 0.85rem;
    }

    .smart-select select:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
    }

    .smart-select .material-symbols-outlined {
      position: absolute;
      right: 0.65rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 18px;
      pointer-events: none;
    }

    .smart-advanced {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
    }

    .smart-advanced:hover {
      color: #6366f1;
    }

    .advanced-drawer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 50;
    }

    .advanced-drawer.open {
      pointer-events: all;
      opacity: 1;
    }

    .advanced-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(3, 7, 18, 0.55);
    }

    .advanced-panel {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: min(420px, 92vw);
      background: #0f172a;
      border-left: 1px solid rgba(30, 41, 59, 0.8);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transform: translateX(100%);
      transition: transform 0.25s ease;
    }

    .advanced-drawer.open .advanced-panel {
      transform: translateX(0);
    }

    .advanced-panel header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #e2e8f0;
    }

    .advanced-panel header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .advanced-panel header button {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
    }

    .advanced-body {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .advanced-panel footer {
      margin-top: auto;
      display: flex;
      gap: 0.75rem;
    }

    .advanced-panel footer button {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      cursor: pointer;
    }

    .advanced-panel footer .ghost {
      background: transparent;
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: #cbd5f5;
    }

    .advanced-panel footer .primary {
      background: #6366f1;
      color: #fff;
    }

    :host-context(body[data-theme='light']) .smart-filter-bar {
      background: #ffffff;
      border-color: rgba(148, 163, 184, 0.35);
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    :host-context(body[data-theme='light']) .smart-search {
      background: #f8fafc;
    }

    :host-context(body[data-theme='light']) .smart-search input {
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .smart-search .material-symbols-outlined {
      color: #94a3b8;
    }

    :host-context(body[data-theme='light']) .smart-select select {
      background: #f8fafc;
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .smart-select .material-symbols-outlined {
      color: #94a3b8;
    }

    :host-context(body[data-theme='light']) .smart-advanced {
      color: #64748b;
    }

    :host-context(body[data-theme='light']) .smart-advanced:hover {
      color: #4338ca;
    }

    :host-context(body[data-theme='light']) .advanced-backdrop {
      background: rgba(15, 23, 42, 0.35);
    }

    :host-context(body[data-theme='light']) .advanced-panel {
      background: #ffffff;
      border-color: rgba(148, 163, 184, 0.4);
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .advanced-panel header {
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .advanced-panel header button {
      color: #94a3b8;
    }

    :host-context(body[data-theme='light']) .advanced-body {
      color: #64748b;
    }

    :host-context(body[data-theme='light']) .advanced-panel footer .ghost {
      border-color: rgba(148, 163, 184, 0.5);
      color: #475569;
    }

    :host-context(body[data-theme='light']) .advanced-panel footer .primary {
      background: #4f46e5;
    }
  `]
})
export class SmartFilterBarComponent {
  @Input() searchTerm = '';
  @Input() filterType = '';
  @Input() filterCity = '';
  @Input() filterSold = '';

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() filterTypeChange = new EventEmitter<string>();
  @Output() filterCityChange = new EventEmitter<string>();
  @Output() filterSoldChange = new EventEmitter<string>();
  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  advancedOpen = false;

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }

  onTypeChange(value: string) {
    this.filterType = value;
    this.filterTypeChange.emit(value);
    this.apply.emit();
  }

  onCityChange(value: string) {
    this.filterCity = value;
    this.filterCityChange.emit(value);
    this.apply.emit();
  }

  onStatusChange(value: string) {
    this.filterSold = value;
    this.filterSoldChange.emit(value);
    this.apply.emit();
  }

  toggleAdvanced() {
    this.advancedOpen = !this.advancedOpen;
  }
}
