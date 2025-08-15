import { Projet } from "./projet.models";

export interface Tache {
  id: number;
  titre: string;
  description: string;
  fullName: string;
  commentaires?: string;
  dateDebut?: Date;
  dateFin?: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'NON_COMMENCEE';
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE';
  statutLibelle?: string;         // ✅ ajouté
  prioriteLibelle?: string;       // ✅ ajouté
  tempsEstime?: number;
  tempsPasse?: number;
  categorie?: string;
  createdAt?: Date;
  updatedAt?: Date;
  responsable?: number;
  projet?: Projet;
}
