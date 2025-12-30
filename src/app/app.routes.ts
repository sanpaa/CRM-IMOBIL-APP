import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'clients',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/clients/client-list.component').then(m => m.ClientListComponent)
  },
  {
    path: 'properties',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/properties/property-list.component').then(m => m.PropertyListComponent)
  },
  {
    path: 'visits',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/visits/visit-list.component').then(m => m.VisitListComponent)
  },
  {
    path: 'deals',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/deals/deal-list.component').then(m => m.DealListComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
