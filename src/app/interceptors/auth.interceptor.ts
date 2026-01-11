import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * HTTP Interceptor to add authentication token to all requests
 * Only adds token to requests to the backend API, not to external services like Supabase
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAuthToken();

  // Only add token to requests to the backend API (not external services)
  const isBackendRequest = req.url.startsWith(environment.apiUrl);
  
  if (token && isBackendRequest) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
