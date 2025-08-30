import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Document } from '../models/document.models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8000/api1/documents';

  constructor(private http: HttpClient,    private sanitizer: DomSanitizer
  ) {}

  private getMultipartHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json'
    });
  }
  getDocumentPreview(id: number): Observable<{ content: SafeResourceUrl, type: string }> {
    return this.http.get<{ content: string, type: string }>(`${this.apiUrl}/${id}/preview`).pipe(
      map(response => ({
        content: this.sanitizer.bypassSecurityTrustResourceUrl(response.content),
        type: response.type
      }))
    );
  }
  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.error?.message || error.statusText}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // 🧾 Récupération des documents
  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => ({
        id: response.id ?? null,
        name: response.name ?? '',
        fileName: response.fileName ?? '',
        type: response.type ?? 'application/octet-stream',
        url: response.url ?? '',
        dossier: response.dossier ?? null,
        createdAt: response.createdAt ? new Date(response.createdAt) : null,
        fileSize: response.fileSize ?? 0,
        content: response.content ?? '',
        archived: response.archived ?? false
      } as Document)),
      catchError(this.handleError)
    );
  }

  getDocumentsByDossier(dossierId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/dossiers/${dossierId}`)
      .pipe(catchError(this.handleError));
  }

  getDocumentsByParent(parentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/parent/${parentId}`)
      .pipe(catchError(this.handleError));
  }

  getDocumentsByProjectId(userId:number, projectId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/projets/${projectId}`)
      .pipe(catchError(this.handleError));
  }

  getActiveDocumentsByDossierId(dossierId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/dossiers/${dossierId}/active`)
      .pipe(catchError(this.handleError));
  }

  getArchivedDocumentsByDossierId(dossierId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/dossiers/${dossierId}/archived`)
      .pipe(catchError(this.handleError));
  }

  getActiveDocuments(currentUserId: number, userId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/active/${currentUserId}`)
      .pipe(catchError(this.handleError));
  }

  getArchivedDocuments(currentUserId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/archived/${currentUserId}`)
      .pipe(catchError(this.handleError));
  }
getRootDocumentsByProject(projectId: number): Observable<Document[]> {
  return this.http.get<Document[]>(`${this.apiUrl}/${projectId}/root`);
}

  // 📤 Téléversement & création
  uploadDocument(
    name: string,
    file: File,
    dossierId: number | null,
    userId: number,
    parentId: number | null,
    projetId: number | null
  ): Observable<Document> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    formData.append('userId', userId.toString());

    // Ajouter dossierId seulement s'il n'est pas null
    if (dossierId !== null) {
      formData.append('dossierId', dossierId.toString());
    }

    // Ajouter projetId seulement s'il n'est pas null
    if (projetId !== null) {
      formData.append('projetId', projetId.toString());
    }

    // Ajouter parentId seulement s'il n'est pas null
    if (parentId !== null) {
      formData.append('parentId', parentId.toString());
    }

    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }





  // ✏️ Mise à jour
  updateDocument(
    documentId: number,
    dossierId: number,
    data: { name: string; content?: string; file?: File; },
    existingDocument: Document
  ): Observable<Document> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.content) formData.append('content', data.content);
    if (data.file) formData.append('file', data.file, data.file.name);

    return this.http.put<Document>(
      `${this.apiUrl}/${documentId}?dossierId=${dossierId}`,
      formData
    ).pipe(catchError(this.handleError));
  }

  // 📥 Téléchargement & preview
  downloadFile(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }



  // 📦 Archivage & restauration
  archiveDocument(id: number | null): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  restoreDocument(id: number, currentUserId: number): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/${id}/restore`, {})
      .pipe(catchError(this.handleError));
  }

  // ❌ Suppression
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
