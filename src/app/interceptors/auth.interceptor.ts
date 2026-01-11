import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * HTTP Interceptor to add authentication token and tenant context to all requests
 * Only adds headers to requests to the backend API, not to external services like Supabase
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAuthToken();

  // Only add headers to requests to the backend API (not external services)
  const isBackendRequest = req.url.startsWith(environment.apiUrl);
  
  if (isBackendRequest) {
    const headers: { [key: string]: string } = {};
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add tenant context (company_id) if available
    const companyId = authService.getValidCompanyId();
    if (companyId) {
      headers['X-Company-Id'] = companyId;
    }
    
    // Clone request with headers if any were added
    if (Object.keys(headers).length > 0) {
      const cloned = req.clone({
        setHeaders: headers
      });
      return next(cloned);
    }
  }

  return next(req);
};
