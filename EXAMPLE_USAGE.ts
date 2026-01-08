/**
 * Example Usage: Comprehensive Filtering and Pagination
 * 
 * This file demonstrates how to use the new filtering and pagination features
 * in the Property, Client, and Visit services.
 */

import { Component } from '@angular/core';
import { PropertyService } from './app/services/property.service';
import { ClientService } from './app/services/client.service';
import { VisitService } from './app/services/visit.service';

/**
 * Example 1: Property Filtering with Pagination
 */
export class PropertyListComponent {
  constructor(private propertyService: PropertyService) {}

  async loadProperties() {
    // Multi-filter query with pagination
    const result = await this.propertyService.findPaginated({
      type: 'Apartamento',
      city: 'São Paulo',
      bedrooms: 3,
      priceMin: 200000,
      priceMax: 500000,
      page: 1,
      limit: 10
    });

    console.log(`Found ${result.total} properties`);
    console.log(`Showing page ${result.page} of ${result.totalPages}`);
    console.log('Properties:', result.data);
  }

  async searchProperties(searchTerm: string) {
    // Text search across multiple fields (title, description, street, neighborhood, city)
    const result = await this.propertyService.findPaginated({
      search: searchTerm,
      page: 1,
      limit: 10
    });

    return result;
  }

  async getFeaturedProperties() {
    // Get featured, unsold properties
    const result = await this.propertyService.findPaginated({
      featured: true,
      sold: false,
      page: 1,
      limit: 6
    });

    return result;
  }

  async filterByLocation() {
    // Filter by state and neighborhood
    const result = await this.propertyService.findPaginated({
      state: 'SP',
      neighborhood: 'Jardins',
      areaMin: 80,
      areaMax: 150,
      page: 1,
      limit: 10
    });

    return result;
  }
}

/**
 * Example 2: Client Filtering with Pagination
 */
export class ClientListComponent {
  constructor(private clientService: ClientService) {}

  async loadClients() {
    // Basic pagination
    const result = await this.clientService.findPaginated({
      page: 1,
      limit: 10
    });

    console.log(`Found ${result.total} clients`);
    console.log('Clients:', result.data);
  }

  async searchClients(searchTerm: string) {
    // Search across name, email, phone, and CPF
    const result = await this.clientService.findPaginated({
      search: searchTerm,
      createdAfter: '2024-01-01',
      page: 1,
      limit: 10
    });

    return result;
  }

  async filterByEmail(domain: string) {
    // Filter by email domain
    const result = await this.clientService.findPaginated({
      email: `@${domain}`,
      page: 1,
      limit: 10
    });

    return result;
  }

  async getRecentClients() {
    // Get clients created in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await this.clientService.findPaginated({
      createdAfter: oneMonthAgo.toISOString().split('T')[0],
      page: 1,
      limit: 20
    });

    return result;
  }
}

/**
 * Example 3: Visit Filtering with Pagination
 */
export class VisitListComponent {
  constructor(private visitService: VisitService) {}

  async loadVisits() {
    // Get all visits (no pagination)
    const allVisits = await this.visitService.findPaginated({});
    
    console.log(`Total visits: ${allVisits.length}`);
    console.log('Visits:', allVisits);
  }

  async loadVisitsPaginated() {
    // Get paginated visits
    const result = await this.visitService.findPaginated({
      page: 1,
      limit: 20
    });

    console.log(`Found ${result.total} visits`);
    console.log(`Page ${result.page} of ${result.totalPages}`);
    return result;
  }

  async getScheduledVisits() {
    // Get scheduled visits for a date range
    const result = await this.visitService.findPaginated({
      status: 'Agendada',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      page: 1,
      limit: 20
    });

    return result;
  }

  async getBrokerVisits(brokerId: string) {
    // Get all visits for a specific broker
    const result = await this.visitService.findPaginated({
      broker: brokerId,
      page: 1,
      limit: 20
    });

    return result;
  }

  async searchVisitNotes(searchTerm: string) {
    // Search in visit notes
    const result = await this.visitService.findPaginated({
      search: searchTerm,
      page: 1,
      limit: 10
    });

    return result;
  }

  async getComplexFilter() {
    // Multiple filters combined
    const result = await this.visitService.findPaginated({
      status: 'Agendada',
      broker: 'broker-uuid',
      dateFrom: '2024-01-01',
      client: 'client-uuid',
      page: 1,
      limit: 10
    });

    return result;
  }
}

/**
 * Example 4: Implementing Pagination Controls
 */
export class PaginationControlsComponent {
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalRecords = 0;

  constructor(private propertyService: PropertyService) {}

  async loadPage(page: number) {
    const result = await this.propertyService.findPaginated({
      page: page,
      limit: this.pageSize
    });

    this.currentPage = result.page;
    this.totalPages = result.totalPages;
    this.totalRecords = result.total;

    return result.data;
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      return this.loadPage(this.currentPage + 1);
    }
  }

  async previousPage() {
    if (this.currentPage > 1) {
      return this.loadPage(this.currentPage - 1);
    }
  }

  async firstPage() {
    return this.loadPage(1);
  }

  async lastPage() {
    return this.loadPage(this.totalPages);
  }
}

/**
 * Example 5: Using with Angular Observables
 */
export class ObservableExampleComponent {
  constructor(
    private propertyService: PropertyService,
    private clientService: ClientService
  ) {}

  async loadDataWithErrorHandling() {
    try {
      // Properties
      const properties = await this.propertyService.findPaginated({
        city: 'São Paulo',
        page: 1,
        limit: 10
      });

      // Clients
      const clients = await this.clientService.findPaginated({
        status: 'Ativo',
        page: 1,
        limit: 10
      });

      return { properties, clients };
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
}
