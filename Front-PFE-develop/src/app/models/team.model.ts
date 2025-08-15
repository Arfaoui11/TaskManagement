import { User } from "./user.model";
export interface Team {
  id: number;  // Ajoute '?' pour rendre 'id' optionnel
    name: string;
  users: any[]; // ou members?: any[];
  }