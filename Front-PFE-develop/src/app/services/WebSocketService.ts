import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Stomp, CompatClient } from '@stomp/stompjs';
import { Notification } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: CompatClient | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private notifications: any[] = [];

  constructor() {
    this.connect();
  }

  private connect(): void {
    const wsUrl = 'ws://localhost:8081/ws';  // WebSocket natif, pas SockJS
    this.stompClient = Stomp.client(wsUrl);

    this.stompClient.debug = (msg) => console.log('STOMP: ', msg);

    this.stompClient.heartbeatIncoming = 0;
    this.stompClient.heartbeatOutgoing = 0;

    const onConnect = () => {
      console.log('✅ Connecté via WebSocket natif');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStatusSubject.next(true);

      this.stompClient!.subscribe('/topic/notifications', (msg) => {
  const notification = JSON.parse(msg.body);
  console.log('Notification reçue :', notification);

  if (!notification.timestamp) {
    notification.timestamp = new Date(); // fallback si manquant
  }

  this.notifications.unshift(notification);
  this.notificationsSubject.next([...this.notifications]);
});

    };

    const onError = (error: any) => {
      console.error('❌ Erreur WebSocket:', error);
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
      this.handleReconnection();
    };

    this.stompClient.connect({}, onConnect, onError);
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnexion tentative ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max tentatives de reconnexion atteintes');
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.disconnect(() => {
        console.log('🔌 WebSocket déconnecté');
        this.isConnected = false;
        this.connectionStatusSubject.next(false);
      });
    }
  }
  reconnect(): void {
    if (this.stompClient && !this.stompClient.connected) {
      this.connect();
    }
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.message);
    }
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next(this.notifications);
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.notificationsSubject.next(this.notifications);
  }
  

}
