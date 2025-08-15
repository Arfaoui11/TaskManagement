// notification.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../services/WebSocketService';
import { Notification } from '../../../models/notification.models';
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  isConnected = false;
  showDropdown = false;
  unreadCount = 0;

  private notificationsSubscription: Subscription = new Subscription();
  private connectionSubscription: Subscription = new Subscription();

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // S'abonner aux notifications
    this.notificationsSubscription = this.webSocketService.notifications$.subscribe(
      (notifications) => {
        this.notifications = notifications;
        this.updateUnreadCount();
      }
    );

    // S'abonner au statut de connexion
    this.connectionSubscription = this.webSocketService.connectionStatus$.subscribe(
      (status) => {
        this.isConnected = status;
      }
    );

    // Demander la permission pour les notifications browser
    this.webSocketService.requestNotificationPermission();
  }

  ngOnDestroy() {
    this.notificationsSubscription.unsubscribe();
    this.connectionSubscription.unsubscribe();
  }
getTimeAgo(timestamp: Date | string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return ''; // Date invalide => rien n'affiche

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;

  return date.toLocaleDateString();
}
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.markAllAsViewed();
    }
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  removeNotification(notification: Notification) {
    if (notification.id) {
      this.webSocketService.removeNotification(notification.id);
    }
  }

  clearAllNotifications() {
    this.webSocketService.clearAllNotifications();
    this.closeDropdown();
  }

  reconnect() {
    this.webSocketService.reconnect();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'projet_cree':
        return 'fas fa-project-diagram';
      case 'utilisateur_ajoute':
        return 'fas fa-user-plus';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-info-circle';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'projet_cree':
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'utilisateur_ajoute':
      case 'info':
      default:
        return 'notification-info';
    }
  }

  
  private updateUnreadCount() {
    // Ici tu peux implémenter la logique pour compter les non-lus
    // Pour l'exemple, on compte les 10 plus récentes comme "nouvelles"
    this.unreadCount = Math.min(this.notifications.length, 10);
  }

  private markAllAsViewed() {
    // Reset le compteur quand on ouvre le dropdown
    this.unreadCount = 0;
  }

  trackByFn(index: number, item: Notification): any {
    return item.id || index;
  }
}