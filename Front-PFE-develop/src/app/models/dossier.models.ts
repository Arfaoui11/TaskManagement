import { Projet } from "./projet.models";

export interface Dossier {
  id: number;
  name: string;
  userId: number; // userId ne peut plus être undefined
  projet?: Projet; // Utilisez l'interface Projet au lieu de `any`
  createdAt?: string; // Utilisez `Date` si vous manipulez des dates
  documents?: Document[];
  archived: boolean; // <--- ici
  subDossiers: Dossier[]; // Toujours initialisé comme tableau vide par défaut
  parentId: number;
  expanded?: boolean;  // <-- Ajouter cette ligne

  // Utilisez une interface Document si elle existe
}