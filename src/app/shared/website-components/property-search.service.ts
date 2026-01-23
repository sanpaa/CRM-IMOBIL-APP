import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PropertySearchFilters {
  term?: string;
  type?: string;
  city?: string;
  bedrooms?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PropertySearchService {
  private readonly filtersSubject = new BehaviorSubject<PropertySearchFilters>({});

  readonly filters$ = this.filtersSubject.asObservable();

  setFilters(filters: PropertySearchFilters) {
    this.filtersSubject.next({ ...filters });
  }
}
