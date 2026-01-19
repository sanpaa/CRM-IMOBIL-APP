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

  private normalizeResults(result: Partial<GlobalSearchResults>): GlobalSearchResults {
    return {
      clients: (result.clients || []).slice(0, 5),
      properties: (result.properties || []).slice(0, 5),
      deals: (result.deals || []).slice(0, 5),
      visits: (result.visits || []).slice(0, 5)
    };
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
