import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DossierService } from '../../services/dossier.service';
import { AuthService } from '../../services/auth.service';
import { Dossier } from '../../models/dossier.models';
import { Projet } from '../../models/projet.models';
import { ProjetService } from '../../services/projet.service';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.models';

@Component({
  selector: 'app-archieve',
  templateUrl: './archieve.component.html',
  styleUrls: ['./archieve.component.css']
})
export class ArchieveComponent implements OnInit {
  dossiers: Dossier[] = [];
  projets: Projet[] = [];
  documents: Document[] = [];

  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  currentUserId: number | null = null;

  constructor(
    private dossierService: DossierService,
    private projetService: ProjetService,
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifyAuthentication();
  }

  private verifyAuthentication(): void {
    const userInfo = this.authService.getUserInfo();

    if (!userInfo?.id) {
      this.error = 'Veuillez vous connecter pour accéder aux archives';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId = userInfo.id;
    this.loadArchivedData();
  }

  loadArchivedData(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    let dossiersLoaded = false;
    let projetsLoaded = false;
    let documentsLoaded = false;

    // Dossiers archivés
    this.dossierService.getArchivedDossiers(this.currentUserId).subscribe({
      next: (data) => {
        this.dossiers = data;
        dossiersLoaded = true;
        this.finishLoading(dossiersLoaded, projetsLoaded, documentsLoaded);
      },
      error: () => {
        this.error = 'Erreur lors du chargement des dossiers archivés';
        dossiersLoaded = true;
        this.finishLoading(dossiersLoaded, projetsLoaded, documentsLoaded);
      }
    });

    // Projets archivés
    this.projetService.getArchivedProjets(this.currentUserId).subscribe({
      next: (data) => {
        this.projets = data;
        projetsLoaded = true;
        this.finishLoading(dossiersLoaded, projetsLoaded, documentsLoaded);
      },
      error: () => {
        this.error = 'Erreur lors du chargement des projets archivés';
        projetsLoaded = true;
        this.finishLoading(dossiersLoaded, projetsLoaded, documentsLoaded);
      }
    });

    // Documents archivés
    this.documentService.getArchivedDocuments(this.currentUserId).subscribe({
      next: (data) => {
        this.documents = data;
        documentsLoaded = true;
        this.finishLoading(dossiersLoaded, projetsLoaded, documentsLoaded);
      },
      error: () => {
        this.error = 'Erreur lors du chargement des documents archivés';
        documentsLoaded = true;
        this.finishLoading(dossiersLoaded, projetsLoaded, documentsLoaded);
      }
    });
  }

  private finishLoading(dossiers: boolean, projets: boolean, documents: boolean): void {
    if (dossiers && projets && documents) this.loading = false;
  }

  // Méthodes de restauration
  restoreDossier(dossierId: number): void {
    if (!this.currentUserId) return;

    this.dossierService.restoreDossier(dossierId, this.currentUserId).subscribe({
      next: () => {
        this.showSuccess('Dossier restauré avec succès');
        this.loadArchivedData();
      },
      error: () => this.showError('Erreur lors de la restauration du dossier')
    });
  }

  restoreProjet(projetId: number): void {
    if (!this.currentUserId) return;

    this.projetService.restoreProjet(projetId, this.currentUserId).subscribe({
      next: () => {
        this.showSuccess('Projet restauré avec succès');
        this.loadArchivedData();
      },
      error: () => this.showError('Erreur lors de la restauration du projet')
    });
  }

  restoreDocument(documentId: number): void {
    if (!this.currentUserId) return;

    this.documentService.restoreDocument(documentId, this.currentUserId).subscribe({
      next: () => {
        this.showSuccess('Document restauré avec succès');
        this.loadArchivedData();
      },
      error: () => this.showError('Erreur lors de la restauration du document')
    });
  }

  // Méthodes de suppression
  deleteDossier(dossierId: number): void {
    this.dossierService.deleteDossier(dossierId).subscribe({
      next: () => {
        this.showSuccess('Dossier supprimé avec succès');
        this.loadArchivedData();
      },
      error: () => this.showError('Erreur lors de la suppression du dossier')
    });
  }

  deleteProjet(projetId: number): void {
    this.projetService.deleteProjet(projetId).subscribe({
      next: () => {
        this.showSuccess('Projet supprimé avec succès');
        this.loadArchivedData();
      },
      error: () => this.showError('Échec de la suppression du projet')
    });
  }

  deleteDocument(documentId: number | null): void {
    if (!documentId) return;

    this.documentService.deleteDocument(documentId).subscribe({
      next: () => {
        this.showSuccess('Document supprimé avec succès');
        this.loadArchivedData();
      },
      error: () => this.showError('Erreur lors de la suppression du document')
    });
  }

  // Gestion des messages
  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.error = null;
  }

  private showError(message: string): void {
    this.error = message;
    this.successMessage = null;
  }
}
