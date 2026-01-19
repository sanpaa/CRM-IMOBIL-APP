import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type GlobalSearchCategory = 'clients' | 'properties' | 'deals' | 'visits' | 'command';

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  category: GlobalSearchCategory;
}

export interface GlobalSearchResults {
  clients: GlobalSearchItem[];
  properties: GlobalSearchItem[];
  deals: GlobalSearchItem[];
  visits: GlobalSearchItem[];
}

const EMPTY_RESULTS: GlobalSearchResults = {
  clients: [],
  properties: [],
  deals: [],
  visits: []
};

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private readonly apiUrl = `${environment.apiUrl}/search`;
  private readonly cache = new Map<string, GlobalSearchResults>();

  constructor(private http: HttpClient) {}

  search(rawTerm: string): Observable<GlobalSearchResults> {
    const normalized = this.normalizeTerm(rawTerm);
    if (!normalized) {
      return of(EMPTY_RESULTS);
    }

    const cached = this.cache.get(normalized);
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('q', normalized)
      .set('limit', '5');

    return this.http.get<Partial<GlobalSearchResults>>(this.apiUrl, { params }).pipe(
      map(result => this.normalizeResults(result)),
      tap(result => this.cache.set(normalized, result))
    );
  }

  private normalizeResults(result: Partial<GlobalSearchResults> & {
    clientes?: unknown[];
    imoveis?: unknown[];
    negocios?: unknown[];
    visitas?: unknown[];
  }): GlobalSearchResults {
    const clients = this.normalizeClientItems(this.coerceArray(result.clients ?? result.clientes ?? []));
    const properties = this.normalizePropertyItems(this.coerceArray(result.properties ?? result.imoveis ?? []));
    const deals = this.normalizeDealItems(this.coerceArray(result.deals ?? result.negocios ?? []));
    const visits = this.normalizeVisitItems(this.coerceArray(result.visits ?? result.visitas ?? []));

    return {
      clients: clients.slice(0, 5),
      properties: properties.slice(0, 5),
      deals: deals.slice(0, 5),
      visits: visits.slice(0, 5)
    };
  }

  private normalizeClientItems(items: Array<Record<string, unknown>>): GlobalSearchItem[] {
    return items.map(item => ({
      id: String(item['id'] ?? ''),
      title: String(item['nome'] ?? item['name'] ?? 'Cliente'),
      subtitle: item['telefone'] ? String(item['telefone']) : item['phone'] ? String(item['phone']) : undefined,
      category: 'clients'
    }));
  }

  private normalizePropertyItems(items: Array<Record<string, unknown>>): GlobalSearchItem[] {
    return items.map(item => ({
      id: String(item['id'] ?? ''),
      title: String(item['referencia'] ?? item['reference'] ?? item['codigo'] ?? item['code'] ?? 'Imovel'),
      subtitle: item['endereco'] ? String(item['endereco']) : item['address'] ? String(item['address']) : undefined,
      category: 'properties'
    }));
  }

  private normalizeDealItems(items: Array<Record<string, unknown>>): GlobalSearchItem[] {
    return items.map(item => ({
      id: String(item['id'] ?? ''),
      title: String(item['titulo'] ?? item['title'] ?? 'Negocio'),
      subtitle: item['status'] ? String(item['status']) : undefined,
      category: 'deals'
    }));
  }

  private normalizeVisitItems(items: Array<Record<string, unknown>>): GlobalSearchItem[] {
    return items.map(item => ({
      id: String(item['id'] ?? ''),
      title: String(item['titulo'] ?? item['title'] ?? item['cliente'] ?? item['client'] ?? 'Visita'),
      subtitle: item['data'] ? String(item['data']) : item['date'] ? String(item['date']) : undefined,
      category: 'visits'
    }));
  }

  private coerceArray(value: unknown): Array<Record<string, unknown>> {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
  }

  private normalizeTerm(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
