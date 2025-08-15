import { User } from "./user.model";
export interface PasswordResetToken {
    id: number;
    token: string;
    user: User;
    expirationTime: string; // ISO date format
  }
  