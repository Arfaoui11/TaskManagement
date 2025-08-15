export interface Notification {
  id?: number;
  type: string;
  message: string;
  projetId?: number;
  userId?: number;
  timestamp?: Date;
}