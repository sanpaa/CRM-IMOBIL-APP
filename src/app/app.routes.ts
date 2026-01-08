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
    path: 'welcome',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'public/:companyId',
    loadComponent: () => import('./components/public-website/public-website.component').then(m => m.PublicWebsiteComponent)
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
        path: 'owners',
        loadComponent: () => import('./components/owners/owner-list.component').then(m => m.OwnerListComponent)
      },
      {
        path: 'visits',
        loadComponent: () => import('./components/visits/visit-list.component').then(m => m.VisitListComponent)
      },
      {
        path: 'deals',
        loadComponent: () => import('./components/deals/deal-list.component').then(m => m.DealListComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'public-site-settings',
        loadComponent: () => import('./components/settings/public-site-settings.component').then(m => m.PublicSiteSettingsComponent)
      },
      {
        path: 'website-builder',
        loadComponent: () => import('./components/website-builder/website-builder.component').then(m => m.WebsiteBuilderComponent)
      },
      {
        path: 'domain-settings',
        loadComponent: () => import('./components/domain-settings/domain-settings.component').then(m => m.DomainSettingsComponent)
      },
      {
        path: 'whatsapp',
        loadComponent: () => import('./components/settings/whatsapp-settings/whatsapp-settings.component').then(m => m.WhatsAppSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
