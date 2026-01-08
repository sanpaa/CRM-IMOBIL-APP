# Manual Testing Guide for Filter and Pagination Enhancements

This document provides test scenarios to validate the new filtering and pagination functionality.

## Test Setup

1. Ensure you have test data in Supabase:
   - At least 15-20 properties with varied attributes
   - At least 15-20 clients
   - At least 15-20 visits

## 1. Property Service Tests

### Test 1.1: Basic Pagination
```typescript
// In Angular component or service
const result = await propertyService.findPaginated({
  page: 1,
  limit: 10
});

// Expected: 
// - result.data contains up to 10 properties
// - result.total shows total count
// - result.page = 1
// - result.totalPages = Math.ceil(total / 10)
```

### Test 1.2: Multiple Filters
```typescript
const result = await propertyService.findPaginated({
  type: 'Apartamento',
  city: 'São Paulo',
  bedrooms: 3,
  priceMin: 200000,
  priceMax: 500000,
  page: 1,
  limit: 10
});

// Expected: Only properties matching ALL criteria
```

### Test 1.3: Text Search
```typescript
const result = await propertyService.findPaginated({
  search: 'Jardim',
  page: 1,
  limit: 10
});

// Expected: Properties with "Jardim" in title, description, street, neighborhood, or city
```

### Test 1.4: State and Neighborhood Filters
```typescript
const result = await propertyService.findPaginated({
  state: 'SP',
  neighborhood: 'Centro',
  page: 1,
  limit: 10
});

// Expected: Properties in SP state and Centro neighborhood
```

### Test 1.5: Area Range Filters
```typescript
const result = await propertyService.findPaginated({
  areaMin: 50,
  areaMax: 150,
  page: 1,
  limit: 10
});

// Expected: Properties with area between 50 and 150
```

### Test 1.6: Boolean Filters
```typescript
const result = await propertyService.findPaginated({
  sold: false,
  featured: true,
  page: 1,
  limit: 10
});

// Expected: Unsold, featured properties only
```

### Test 1.7: Offline Fallback
```typescript
// Simulate offline mode by disconnecting from network
const result = await propertyService.findPaginated({
  city: 'São Paulo',
  bedrooms: 2,
  page: 1,
  limit: 5
});

// Expected: Falls back to client-side filtering and pagination
```

## 2. Client Service Tests

### Test 2.1: Basic Pagination
```typescript
const result = await clientService.findPaginated({
  page: 1,
  limit: 10
});

// Expected: 
// - result.data contains up to 10 clients
// - result.total shows total count
// - result.page = 1
// - result.totalPages calculated correctly
```

### Test 2.2: Name Filter
```typescript
const result = await clientService.findPaginated({
  name: 'João',
  page: 1,
  limit: 10
});

// Expected: Clients with "João" in name (case-insensitive)
```

### Test 2.3: Email and Phone Filters
```typescript
const result = await clientService.findPaginated({
  email: '@gmail.com',
  page: 1,
  limit: 10
});

// Expected: Clients with gmail.com email addresses
```

### Test 2.4: Date Range Filters
```typescript
const result = await clientService.findPaginated({
  createdAfter: '2024-01-01',
  createdBefore: '2024-12-31',
  page: 1,
  limit: 10
});

// Expected: Clients created in 2024
```

### Test 2.5: General Search
```typescript
const result = await clientService.findPaginated({
  search: 'João',
  page: 1,
  limit: 10
});

// Expected: Clients with "João" in name, email, phone, or CPF
```

## 3. Visit Service Tests

### Test 3.1: Pagination
```typescript
const result = await visitService.findPaginated({
  page: 1,
  limit: 10
});

// Expected: Paginated visits with metadata
```

### Test 3.2: No Pagination (All Results)
```typescript
const result = await visitService.findPaginated({});

// Expected: Array of all visits (not PaginatedResponse)
```

### Test 3.3: Status Filter
```typescript
const result = await visitService.findPaginated({
  status: 'Agendada',
  page: 1,
  limit: 10
});

// Expected: Only visits with "Agendada" status
```

### Test 3.4: Date Range Filter
```typescript
const result = await visitService.findPaginated({
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
  page: 1,
  limit: 20
});

// Expected: Visits in January 2024
```

### Test 3.5: Multiple Filters
```typescript
const result = await visitService.findPaginated({
  status: 'Agendada',
  broker: 'broker-uuid-here',
  dateFrom: '2024-01-01',
  page: 1,
  limit: 10
});

// Expected: Scheduled visits for specific broker from 2024-01-01 onwards
```

### Test 3.6: Search Filter
```typescript
const result = await visitService.findPaginated({
  search: 'importante',
  page: 1,
  limit: 10
});

// Expected: Visits with "importante" in notes field
```

## API Response Format Validation

All paginated responses should follow this format:

```typescript
{
  "data": [...], // Array of entities
  "total": 45,   // Total count of matching records
  "page": 1,     // Current page number
  "totalPages": 5 // Total number of pages
}
```

## Edge Cases to Test

1. **Empty Results**: Filters that match no records should return empty data array
2. **Invalid Page**: Page numbers beyond totalPages should return empty results
3. **Zero Limit**: Should use default limit (10)
4. **Negative Values**: Should handle gracefully
5. **Special Characters**: Search terms with special characters should be escaped

## Performance Tests

1. Large result sets (1000+ records) with pagination
2. Complex filter combinations (5+ filters)
3. Search with very common terms
4. Offline fallback with large datasets

## Success Criteria

✅ All filters work independently
✅ Multiple filters can be combined
✅ Pagination works correctly
✅ Response format is consistent
✅ Offline fallback works for properties
✅ Edge cases are handled gracefully
✅ Input validation applied to search terms (length limited to 100 chars, null bytes removed)
✅ Supabase properly parameterizes queries to prevent SQL injection
✅ Performance is acceptable (< 2s for queries)
