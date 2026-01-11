import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-center">
      <button class="notification-bell" (click)="togglePanel()" [class.has-unread]="unreadCount > 0">
        <i class="bi bi-bell"></i>
        <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <div class="notification-panel" *ngIf="showPanel">
        <div class="panel-header">
          <h3>
            <i class="bi bi-bell"></i>
            Notificações
          </h3>
          <button class="mark-all-read" *ngIf="unreadCount > 0" (click)="markAllAsRead()">
            <i class="bi bi-check-all"></i>
            Marcar todas como lidas
          </button>
        </div>

        <div class="notification-list" *ngIf="notifications.length > 0">
          <div
            *ngFor="let notification of notifications"
            class="notification-item"
            [class.unread]="!notification.read"
            (click)="markAsRead(notification)"
          >
            <div class="notification-icon">
              <i class="bi" [ngClass]="getNotificationIcon(notification)"></i>
            </div>
            <div class="notification-content">
              <div class="notification-title" *ngIf="notification.title">
                {{ notification.title }}
              </div>
              <div class="notification-message">
                {{ notification.message }}
              </div>
              <div class="notification-time">
                {{ formatTime(notification.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <i class="bi bi-bell-slash"></i>
          <p>Nenhuma notificação</p>
        </div>
      </div>
    </div>
    <div class="notification-overlay" *ngIf="showPanel" (click)="closePanel()"></div>
  `,
  styles: [`
    .notification-center {
      position: relative;
    }

    .notification-bell {
      position: relative;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .notification-bell:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .notification-bell i {
      font-size: 1.5rem;
    }

    .notification-bell.has-unread i {
      animation: bellRing 2s ease-in-out infinite;
    }

    @keyframes bellRing {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
      50% { transform: rotate(0deg); }
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #DC2626;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 10px;
      min-width: 1.25rem;
      text-align: center;
    }

    .notification-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1050;
    }

    .notification-panel {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      z-index: 1051;
      display: flex;
      flex-direction: column;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .panel-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F9FAFB;
      border-radius: 8px 8px 0 0;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1F2937;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mark-all-read {
      background: transparent;
      border: none;
      color: #4B5563;
      font-size: 0.8rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .mark-all-read:hover {
      background: #E5E7EB;
      color: #1F2937;
    }

    .notification-list {
      overflow-y: auto;
      max-height: 400px;
    }

    .notification-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #E5E7EB;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .notification-item:hover {
      background: #F9FAFB;
    }

    .notification-item.unread {
      background: #EFF6FF;
    }

    .notification-item.unread:hover {
      background: #DBEAFE;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-item.unread .notification-icon {
      background: #60A5FA;
      color: white;
    }

    .notification-icon i {
      font-size: 1.25rem;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .notification-message {
      color: #6B7280;
      font-size: 0.875rem;
      line-height: 1.4;
      margin-bottom: 0.25rem;
    }

    .notification-time {
      color: #9CA3AF;
      font-size: 0.75rem;
    }

    .empty-state {
      padding: 3rem 2rem;
      text-align: center;
      color: #9CA3AF;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .notification-panel {
        width: calc(100vw - 2rem);
        max-width: 400px;
        right: -1rem;
      }
    }
  `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showPanel = false;
  private subscription?: any;

  constructor(private notificationService: NotificationService) {}

  async ngOnInit() {
    await this.loadNotifications();
    this.subscribeToNewNotifications();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async loadNotifications() {
    try {
      this.notifications = await this.notificationService.getAll();
      this.updateUnreadCount();
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      // Don't show notifications if user is not authenticated
      if (error?.message?.includes('not authenticated')) {
        this.notifications = [];
        this.unreadCount = 0;
      }
    }
  }

  subscribeToNewNotifications() {
    this.subscription = this.notificationService.subscribeToNotifications(
      (notification) => {
        this.notifications.unshift(notification);
        this.updateUnreadCount();
      }
    );
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
  }

  closePanel() {
    this.showPanel = false;
  }

  async markAsRead(notification: Notification) {
    if (!notification.read) {
      try {
        await this.notificationService.markAsRead(notification.id);
        notification.read = true;
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  }

  async markAllAsRead() {
    try {
      await this.notificationService.markAllAsRead();
      this.notifications.forEach(n => n.read = true);
      this.updateUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  getNotificationIcon(notification: Notification): string {
    // Simple icon based on title or default
    if (notification.title?.toLowerCase().includes('visit')) return 'bi-calendar-check';
    if (notification.title?.toLowerCase().includes('deal')) return 'bi-briefcase';
    if (notification.title?.toLowerCase().includes('client')) return 'bi-people';
    if (notification.title?.toLowerCase().includes('property')) return 'bi-house-door';
    return 'bi-info-circle';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
