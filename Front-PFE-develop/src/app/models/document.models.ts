import { SafeResourceUrl } from '@angular/platform-browser';
import { Dossier } from './dossier.models';
import { Projet } from './projet.models';

export interface Document {
    pageCount: number;
    id: number | null;
    name: string;
    fileName?: string;
    type: string;
    url: string;
    dossier: Dossier;
    projet?: Projet | null;

    createdAt: Date | string | null;
    fileSize?: number | string;
    content?: string; // keep this as the raw base64 string
    safeContent?: SafeResourceUrl; // Pour l'affichage seulement
    userId: number | null;
    archived: boolean;
    parentId: number;
    metadata?: any;

}