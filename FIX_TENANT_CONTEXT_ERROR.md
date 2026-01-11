# Fix: Tenant Context Required Error

## Problem
API endpoints were returning the following error:
```json
{
  "success": false,
  "error": "Tenant context required"
}
```

Affected endpoints:
- `https://crm-imobil.onrender.com/api/subscriptions/usage`
- `https://crm-imobil.onrender.com/api/subscriptions/current`

## Root Cause
The HTTP interceptor (`auth.interceptor.ts`) was only adding the `Authorization` Bearer token to backend API requests, but the backend also requires the tenant context (company_id) to identify which company's data to access in a multi-tenant environment.

## Solution
Modified the `authInterceptor` to include the `X-Company-Id` header in all backend API requests:

1. **auth.interceptor.ts**: Enhanced to add both `Authorization` and `X-Company-Id` headers
2. **environment.prod.ts**: Added missing `apiUrl` configuration for production environment

### Changes Made

#### 1. Updated HTTP Interceptor
The interceptor now:
- Retrieves the company_id from the authenticated user's session
- Adds `X-Company-Id` header to all backend API requests
- Only applies headers to backend API requests (not external services like Supabase)

```typescript
// Before: Only Authorization header
if (token && isBackendRequest) {
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(cloned);
}

// After: Both Authorization and X-Company-Id headers
if (isBackendRequest) {
  const headers: { [key: string]: string } = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const companyId = authService.getValidCompanyId();
  if (companyId) {
    headers['X-Company-Id'] = companyId;
  }
  
  if (Object.keys(headers).length > 0) {
    const cloned = req.clone({ setHeaders: headers });
    return next(cloned);
  }
}
```

#### 2. Added API URL to Production Environment
The production environment configuration was missing the `apiUrl` property, which is required for the interceptor to work correctly:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://crm-imobil.onrender.com/api',  // Added this line
  // ... rest of configuration
};
```

## Verification Steps

### 1. Check Browser Developer Tools
1. Open the application in a browser
2. Login with a valid user account
3. Navigate to the subscription page or dashboard
4. Open Developer Tools (F12) → Network tab
5. Look for requests to `/api/subscriptions/*`
6. Check the request headers and verify both headers are present:
   - `Authorization: Bearer <token>`
   - `X-Company-Id: <uuid>`

### 2. Test Subscription Endpoints
After logging in, the following features should work without "Tenant context required" errors:

- **Dashboard**: Usage widget showing users and properties statistics
- **Subscription Management** (`/subscription`): 
  - Current plan information
  - Usage statistics (users/properties)
  - Available plans for upgrade
- **Navigation**: "Meu Plano" link in sidebar

### 3. Expected Behavior
- **Before fix**: API returns `{success: false, error: "Tenant context required"}`
- **After fix**: API returns proper data with `{success: true, data: {...}}`

## Backend Requirements
This fix assumes the backend API expects the tenant context in the `X-Company-Id` header. If your backend uses a different header name (e.g., `X-Tenant-Id`), update line 28 in `auth.interceptor.ts`:

```typescript
headers['X-Company-Id'] = companyId;  // Change to your header name if different
```

## Multi-Tenant Architecture
This application uses a multi-tenant architecture where:
- Each user belongs to a company (tenant)
- The `company_id` is stored in the user session after login
- All backend API requests must include the tenant context
- Data isolation is enforced at both the frontend and backend levels

## Related Files
- `src/app/interceptors/auth.interceptor.ts` - HTTP interceptor
- `src/app/services/auth.service.ts` - Authentication service with `getValidCompanyId()` method
- `src/environments/environment.ts` - Development environment config
- `src/environments/environment.prod.ts` - Production environment config

## Testing
The application builds successfully:
```bash
npm run build
```

No compilation errors or TypeScript errors were introduced by this change.
