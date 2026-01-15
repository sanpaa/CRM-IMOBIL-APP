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

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
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
  }
}
