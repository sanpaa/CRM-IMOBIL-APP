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
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./components/clients/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'properties',
        loadComponent: () => import('./components/properties/property-list.component').then(m => m.PropertyListComponent)
      },
      {
        path: 'visits',
        loadComponent: () => import('./components/visits/visit-list.component').then(m => m.VisitListComponent)
      },
      {
        path: 'deals',
        loadComponent: () => import('./components/deals/deal-list.component').then(m => m.DealListComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
