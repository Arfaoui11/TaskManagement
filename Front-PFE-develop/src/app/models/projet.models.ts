import { Dossier } from "./dossier.models";
import { User } from "./user.model";

  export interface Projet {
    id: number;
    title: string;
    description: string;
    createdAt: string; // Ou Date si vous convertissez la chaîne en objet Date
    updatedAt: string | null; // Peut être null
    archived: boolean; // <--- ici
    userIds: number[];
    createdBy?:number;
      teamId?: number;            // ✅ nouveau champ

  } // Liste des IDs des utilisateurs associés au projet
  