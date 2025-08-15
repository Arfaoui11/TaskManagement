import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Document } from '../../models/document.models';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  dossierId!: number;
  projetId!: number;
  openedDropdown: string | null = null;
  showConfirmationModal = false;
  confirmationMessage = '';
  currentAction: { type: string; documentId: number } | null = null;

  constructor(
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projetId = +this.route.snapshot.paramMap.get('projetId')!;
    this.dossierId = +this.route.snapshot.paramMap.get('dossierId')!;
    this.loadActiveDocuments();  // Charge les documents actifs au démarrage
  }

  // Chargement des documents actifs pour un dossier spécifique
  loadActiveDocuments() {
    this.documentService.getDocumentsByDossier(this.dossierId).subscribe(
      (data: Document[]) => {
        // Filtre uniquement les documents actifs (non archivés) directement
        this.documents = data.filter((doc) => !doc.archived); 
      },
      (error) => {
        console.error('Erreur lors du chargement des documents :', error);
        alert('Erreur lors du chargement des documents');
      }
    );
  }

  toggleDropdown(documentId: number): void {
    this.openedDropdown = this.openedDropdown === documentId.toString() ? null : documentId.toString();
  }

  closeDropdowns(): void {
    this.openedDropdown = null;
  }

  // Fonction de confirmation pour archiver ou supprimer un document
  private showConfirmation(message: string, actionType: string, documentId: number): void {
    this.confirmationMessage = message;
    this.currentAction = { type: actionType, documentId };
    this.showConfirmationModal = true;
    this.closeDropdowns();
  }

  confirmAction(): void {
    if (!this.currentAction) return;

    const { type, documentId } = this.currentAction;
    if (type === 'archive') {
      this.archiveDocument(documentId);
    } else if (type === 'delete') {
      this.deleteDocument(documentId);
    }

    this.cancelAction();
  }

  cancelAction(): void {
    this.showConfirmationModal = false;
    this.currentAction = null;
  }

  onArchiveDocument(documentId: number): void {
    this.showConfirmation('Voulez-vous archiver ce document ?', 'archive', documentId);
  }

  onDeleteDocument(documentId: number): void {
    this.showConfirmation('Voulez-vous supprimer ce document ?', 'delete', documentId);
  }

  private archiveDocument(documentId: number): void {
    this.documentService.archiveDocument(documentId).subscribe(
      () => {
        this.loadActiveDocuments();  // Rechargement des documents après archivage
        alert('Document archivé avec succès');
      },
      (error) => {
        console.error('Erreur lors de l\'archivage :', error);
        alert('Erreur lors de l\'archivage');
      }
    );
  }

  private deleteDocument(documentId: number): void {
    this.documentService.deleteDocument(documentId).subscribe(
      () => {
        this.loadActiveDocuments();  // Rechargement des documents après suppression
        alert('Document supprimé avec succès');
      },
      (error) => {
        console.error('Erreur lors de la suppression :', error);
        alert('Erreur lors de la suppression');
      }
    );
  }

  // Navigation vers les détails du document
  onViewDocumentDetails(documentId: number) {
    this.router.navigate(['dossiers', this.dossierId, 'documents', documentId]);
    this.closeDropdowns();
  }

  // Navigation vers la page de modification du document
  onEditDocument(documentId: number) {
    this.router.navigate([
      '/dossiers/projets',
      this.projetId,
      'dossiers',
      this.dossierId,
      'documents',
      documentId,
      'update',
    ]);
    this.closeDropdowns();
  }

  // Création d'un nouveau document
  onCreateDocument() {
    this.router.navigate([
      '/dossiers/projets',
      this.projetId,
      'dossiers',
      this.dossierId,
      'documents',
      'create-document',
    ]);
  }

  // Retour à la page précédente
  goBack() {
    this.router.navigate(['/dossiers/projets', this.projetId]);
  }

  // Fermer les dropdowns lorsqu'on clique en dehors d'eux
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as Element).closest('.dropdown')) {
      this.closeDropdowns();
    }
  }
}
