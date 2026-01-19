import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { AuthService } from './services/auth.service';
import { InactivityService } from './services/inactivity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'HSP CRM';
  private authSubscription?: Subscription;
  private themeListener = (event: StorageEvent) => {
    if (event.key === 'theme' && (event.newValue === 'dark' || event.newValue === 'light')) {
      document.body.setAttribute('data-theme', event.newValue);
    }
  };

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    this.applyInitialTheme();
    window.addEventListener('storage', this.themeListener);

    // Subscribe to authentication changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User logged in - start tracking inactivity
        this.inactivityService.startTracking();
      } else {
        // User logged out - stop tracking inactivity
        this.inactivityService.stopTracking();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.inactivityService.stopTracking();
    window.removeEventListener('storage', this.themeListener);
  }

  private applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.body.setAttribute('data-theme', savedTheme);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}
