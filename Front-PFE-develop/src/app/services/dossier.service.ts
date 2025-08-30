import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dossier } from '../models/dossier.models';
import { CreateDossierComponent } from '../projet/create-dossier/create-dossier.component';

@Injectable({
  providedIn: 'root',
})
export class DossierService {
  open(CreateDossierComponent: CreateDossierComponent) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:8000/api1/dossiers'; // Remplacez par l'URL de votre API backend

  constructor(private http: HttpClient) {}

  // Récupérer tous les dossiers
  getAllDossiers(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(this.apiUrl);
  }

  // Récupérer tous les dossiers actifs
  getActiveDossiers(userId: any, projetId: string | null): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`${this.apiUrl}/active/${userId}`);
  }

  // Récupérer tous les dossiers archivés
  getArchivedDossiers(userId:any): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`${this.apiUrl}/archived/${userId}`);
  }

  // Récupérer un dossier par son ID
  getDossierById(id: number): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau dossier
  createDossier0(dossier: Dossier): Observable<Dossier> {
    return this.http.post<Dossier>(this.apiUrl, dossier);
  }
  createDossier(dossier: Dossier, projetId: number, parentId?: number | null): Observable<Dossier> {
    let params = new HttpParams().set('projetId', projetId.toString());

    if (parentId !== null && parentId !== undefined) {
      params = params.set('parentId', parentId.toString());
    }

    return this.http.post<Dossier>(`${this.apiUrl}`, dossier, { params });
  }


  // Mettre à jour un dossier existant
  updateDossier(id: number, dossier: Dossier): Observable<Dossier> {
    return this.http.put<Dossier>(`${this.apiUrl}/${id}`, dossier);
  }

  // Supprimer un dossier
  deleteDossier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Archiver un dossier
  archiveDossier(id: number, currentUserId: number): Observable<Dossier> {
    return this.http.patch<Dossier>(`${this.apiUrl}/${id}/archive`, {});
  }

  // Restaurer un dossier archivé
  restoreDossier(id: number, currentUserId: number): Observable<Dossier> {
    return this.http.patch<Dossier>(`${this.apiUrl}/${id}/restore`, {});
  }

  // Récupérer les dossiers d'un projet spécifique
  getDossiersByProjetId(projetId: string | number, userId?: number): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`${this.apiUrl}/projets/${projetId}`);
  }

  // Récupérer les dossiers actifs d'un projet spécifique
  getActiveDossiersByProjetId(projetId: number, userId: number): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`${this.apiUrl}/projets/${projetId}/active`);
  }

  // Récupérer les dossiers archivés d'un projet spécifique
  getArchivedDossiersByProjetId(projetId: number): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`${this.apiUrl}/projets/${projetId}/archived`);
  }
  getDocumentsByProjetId(projetId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/projets/${projetId}`);
  }
  getRootDossiers(projetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projet/${projetId}/root`);
  }

  getSubDossiers(projetId: number, parentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projet/${projetId}/parent/${parentId}`);
  }


}
