import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Dossier } from '../../models/dossier.models';
import { DossierService } from '../../services/dossier.service';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.models';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { DocumentModalComponent } from '../document-modal/document-modal.component';

@Component({
  selector: 'app-dossiers-documents',
  templateUrl: './dossiers-documents.component.html',
  styleUrls: ['./dossiers-documents.component.css']
})
export class DossiersDocumentsComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  selectedDossier: Dossier | null = null;
  selectedDocument: Document | null = null;
  showDocumentContent: boolean = false;
  showDossierDetails: boolean = false;
  selectedDossierDetails: Dossier | null = null;
  projetId: number | null = null;
sanitizedDocumentUrl: SafeResourceUrl | null = null;

  @Input() dossiers: Dossier[] = [];

  dossierError: string | null = null;
  documentError: string | null = null;
  loadingDocument: boolean = false;
  documentsRacine: Document[] = [];
  loading: boolean = false;

  constructor(
    private dossierService: DossierService,
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
      private dialog: MatDialog

  ) {}

ngOnInit(): void {
    // Log de débogage pour les paramètres de route
    console.log('🔍 Initialisation du composant DossiersDocumentsComponent');
    
    this.route.paramMap.subscribe(params => {
const idParam = params.get('projetId');
      this.projetId = idParam ? +idParam : null;      
     
      
      // Logs détaillés sur le projetId
      console.log('🚀 ProjetId récupéré depuis l\'URL:', this.projetId);
      console.log('🔢 Type de projetId:', typeof this.projetId);
      
      // Vérification de l'authentification
      const userInfo = this.authService.getUserInfo();
      console.log('👤 Informations utilisateur:', userInfo);
      
      if (!userInfo) {
        console.error('❌ Utilisateur non authentifié');
        return;
      }

      // Appel avec logs supplémentaires
      this.getActiveDossiers(); 
      this.getActiveDocuments();
    });
  }

      // Appel avec logs supplémentaires
     
openDocumentModal(doc: Document): void {
  try {
    if (!doc.content || !doc.type) {
      console.error('❌ Document content or type is missing');
      this.documentError = 'Le document ne peut pas être affiché (contenu manquant).';
      return;
    }

    // Decode base64 content
    const fileContent = atob(doc.content);
    const byteNumbers = Array.from(fileContent, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    
    // Create blob with proper MIME type
    const blob = new Blob([byteArray], { type: doc.type });
    const url = URL.createObjectURL(blob);

    // Open modal with proper data structure
    const dialogRef = this.dialog.open(DocumentModalComponent, {
      width: '90%',
      height: '80%',
      maxWidth: '1200px',
      data: {
        document: doc,
        url: url,
        type: doc.type,
        name: doc.name
      }
    });

    // Clean up blob URL when modal closes
    dialogRef.afterClosed().subscribe(() => {
      URL.revokeObjectURL(url);
    });

  } catch (error) {
    console.error('❌ Error opening document modal:', error);
    this.documentError = 'Erreur lors de l\'ouverture du document.';
  }
}


  getActiveDossiers(): void {
    console.log('🗂️ Début de getActiveDossiers()');
    
    // Logs détaillés pour le débogage
    const userInfo = this.authService.getUserInfo();
    console.log('👤 Informations utilisateur:', userInfo);
    
    if (!userInfo || !userInfo.id) {
      console.error('❌ Utilisateur non authentifié.');
      this.dossierError = 'Utilisateur non authentifié.';
      return;
    }

    const userId = userInfo.id;
    console.log('🆔 UserId:', userId);

   const projetIdAsNumber = this.projetId ? +this.projetId : null;
console.log('🔍 projetId converti:', projetIdAsNumber, 'type:', typeof projetIdAsNumber);  

    if (projetIdAsNumber === null || isNaN(projetIdAsNumber)) {
      console.error('❌ ID de projet invalide.');
      console.log('🚨 Détails du projetId:', {
        original: this.projetId,
        converted: projetIdAsNumber,
        type: typeof this.projetId
      });
      this.dossierError = 'ID de projet invalide.';
      return;
    }

    console.log('📡 Appel du service avec:', { userId, projetIdAsNumber });

    this.dossierService.getActiveDossiersByProjetId(projetIdAsNumber, userId)
.subscribe({
      next: dossiers => {
        console.log('✅ Dossiers récupérés:', dossiers);
        console.log('📊 Nombre de dossiers:', dossiers.length);
        
        this.dossiers = this.organizeDossiers(dossiers);
        
        console.log('🌳 Dossiers organisés:', this.dossiers);
        console.log('📊 Nombre de dossiers organisés:', this.dossiers.length);
        
        this.dossierError = null;
      },
      error: err => {
        console.error('❌ Erreur de récupération des dossiers:', err);
        console.log('📋 Détails de l\'erreur:', {
          message: err.message,
          status: err.status,
          error: err.error
        });
        this.dossierError = 'Erreur de chargement des dossiers.';
      }
    });
  }


getActiveDocuments(): void {
  const userId = this.authService.getUserInfo()?.id;

  // Récupérer l'ID du projet depuis la route (une seule fois ici)
  const idParam = this.route.snapshot.paramMap.get('projetId');
  this.projetId = idParam ? +idParam : null;

  if (!userId || !this.projetId) {
    this.documentError = 'Utilisateur ou projet non identifié.';
    return;
  }

  // Récupérer les documents liés au projet pour cet utilisateur
  this.documentService.getDocumentsByProjectId(userId, this.projetId).subscribe({
    next: projectDocs => {
      this.documents = projectDocs;

      // Ensuite, récupérer les documents racine du projet
      this.documentService.getRootDocumentsByProject(this.projetId!).subscribe({
        next: rootDocs => {
          this.documentsRacine = rootDocs;
          this.documentError = null;
        },
        error: () => {
          this.documentError = 'Erreur lors de la récupération des documents racine.';
        }
      });
    },
    error: () => {
      this.documentError = 'Erreur lors de la récupération des documents du projet.';
    }
  });
}


  clearMessages(): void {
    this.dossierError = null;
    this.documentError = null;
  }

  // Méthodes existantes précédentes (downloadDocument, archiverDocument, etc.)
  downloadDocument(doc: Document): void {
    const fileContent = atob(doc.content!);
    const blob = new Blob([fileContent], { type: doc.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  organizeDossiers(dossiers: Dossier[]): Dossier[] {
    const map = new Map<number, Dossier>();
    
    // Create a map of dossiers with empty subDossiers array
    dossiers.forEach(d => map.set(d.id, { ...d, subDossiers: [] }));

    const roots: Dossier[] = [];
    dossiers.forEach(d => {
      if (d.parentId && map.has(d.parentId)) {
        // If dossier has a parent, add it to parent's subDossiers
        map.get(d.parentId)!.subDossiers!.push(map.get(d.id)!);
      } else {
        // If no parent, it's a root-level dossier
        roots.push(map.get(d.id)!);
      }
    });
    
    return roots;
  }

 selectDossier(dossier: Dossier): void {
  if (this.selectedDossier && this.selectedDossier.id === dossier.id) {
    // Si on clique sur le même dossier déjà sélectionné
    if (this.showDocumentContent || this.filteredDocuments.length > 0) {
      // On ferme / désélectionne le dossier
      this.selectedDossier = null;
      this.filteredDocuments = [];
      this.selectedDocument = null;
      this.showDocumentContent = false;
      return;
    }
  }

  // Sinon on sélectionne le dossier normalement
  this.selectedDossier = dossier;
  this.selectedDocument = null;
  this.showDocumentContent = false;
  this.filterDocumentsForSelectedDossier();
}

  
filterDocumentsForSelectedDossier() {
  if (!this.selectedDossier) {
    // documents racines : dossier null, projet non null
    this.filteredDocuments = this.documents.filter(doc =>
      doc.projet && doc.projet.id != null && doc.dossier == null
    );
  } else {
    // ici on est sûr que selectedDossier n'est pas null
    this.filteredDocuments = this.documents.filter(doc =>
      doc.dossier && doc.dossier.id === this.selectedDossier!.id
    );
  }
}
closeSelectedDossier(dossier: Dossier): void {
  if (this.selectedDossier && this.selectedDossier.id === dossier.id) {
    this.selectedDossier = null;
    this.filteredDocuments = [];
    this.selectedDocument = null;
    this.showDocumentContent = false;
  }
}

  getAllDossierIds(dossier: Dossier): number[] {
    const ids = [dossier.id];
    dossier.subDossiers?.forEach(sub => ids.push(...this.getAllDossierIds(sub)));
    return ids;
  }

  // Reste des méthodes existantes...
selectDocument(doc: Document): void {
  const isSameDocument = this.selectedDocument?.id === doc.id;

  if (isSameDocument && this.showDocumentContent) {
    this.showDocumentContent = false;
    return;
  }

  this.selectedDocument = { ...doc };
  this.loadingDocument = true;
  this.documentError = null;

  if (doc.content) {
    this.loadingDocument = false;
    this.showDocumentContent = true;
    this.openDocumentModal(doc);
  } else {
    this.loadDocumentContent(doc.id!);
  }
}


 loadDocumentContent(documentId: number): void {
  this.loadingDocument = true;
  this.documentError = null;

  this.documentService.getDocumentById(documentId).subscribe({
    next: doc => {
      console.log('📥 Document reçu du backend:', doc);

      if (!doc.content) {
        console.warn('⚠️ Le backend a renvoyé un document sans contenu.');
        this.documentError = 'Le document est vide ou n\'a pas de contenu.';
        this.loadingDocument = false;
        return;
      }

      this.selectedDocument = { ...doc };
      this.updateDocumentInLists(doc);
      
      // Open modal with loaded content
      this.openDocumentModal(this.selectedDocument);
      
      this.loadingDocument = false;
      this.cdr.detectChanges();
    },
    error: err => {
      console.error('❌ Erreur lors du chargement du contenu du document:', err);
      this.documentError = 'Impossible de charger le contenu du document.';
      this.loadingDocument = false;
    }
  });
}

 // Méthode appelée quand un PDF est chargé
  pdfLoaded(): void {
    console.log('PDF chargé');
    // Ajoutez ici d'autres actions si nécessaire
  }

  // Méthode appelée quand une image ne se charge pas
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.warn('Erreur lors du chargement de l\'image, remplacement par une image par défaut.');
    target.src = 'assets/images/image-not-found.png'; // à adapter selon votre projet
  }
// 4. Pour les problèmes spécifiques au PDF, vérifiez et actualisez explicitement le contenu du PDF
// Ajoutez cette méthode
refreshPdfContent(): void {
  if (this.selectedDocument && this.selectedDocument.type?.includes('pdf')) {
    // Re-créez l'URL sécurisée
    this.prepareDocumentContent(this.selectedDocument);
    
    // Force la mise à jour de l'iframe
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }
}


updateDocumentInLists(updatedDoc: Document): void {
    // Met à jour les documents dans les listes locales avec le contenu chargé
    this.documents = this.documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
    this.filteredDocuments = this.filteredDocuments.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
  }

private createdUrls: string[] = []; // Track created URLs for cleanup

prepareDocumentContent(doc: Document): void {
  if (!doc.content || !doc.type) return;

  try {
    const byteCharacters = atob(doc.content);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: doc.type });

    const url = URL.createObjectURL(blob);
    
    // Track URL for cleanup
    this.createdUrls.push(url);

    // Sécurisation de l'URL pour Angular
    doc.safeContent = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    // S'assurer que le modèle fasse référence à cette propriété
    if (this.selectedDocument && this.selectedDocument.id === doc.id) {
      this.selectedDocument.safeContent = doc.safeContent;
    }
    
    // Force la détection des changements
    this.cdr.detectChanges();
  } catch (error) {
    console.error('❌ Error preparing document content:', error);
    this.documentError = 'Erreur lors de la préparation du contenu du document.';
  }
}

  base64ToUint8Array(base64: string): Uint8Array {
    const raw = atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }



  getImageType(type: string): string {
    if (type.includes('png')) return 'png';
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg';
    if (type.includes('gif')) return 'gif';
    return 'png';
  }

 


  // Autres méthodes d'interaction (ajout, archivage, etc.)
  creerDossierRacine(): void {
    const projetId = this.projetId;
    if (projetId) {
      this.router.navigateByUrl(`/dossiers-documents/projets/${projetId}/create-dossier`);
    } else {
      console.error('❌ Projet non trouvé pour créer un dossier racine.');
    }
  }

  creerDocumentRacine(): void {
    const projetId = this.projetId;
  
    if (!projetId) {
      console.error('❌ Aucun projet valide trouvé pour créer un document racine');
      return;
    }
  
    this.router.navigate([`/dossiers/projets/${projetId}/documents/create-document`]);
  }

  archiverDocument(doc: Document): void {
    const currentUser = this.authService.getUserInfo();
    const currentUserId = currentUser?.id;

    if (!currentUserId) {
      console.error('❌ Utilisateur non authentifié.');
      return;
    }

    this.documentService.archiveDocument(doc.id).subscribe(
  () => {
    console.log('✅ Document archivé avec succès:', doc.id);

    // Mise à jour locale
    this.documents = this.documents.filter(d => d.id !== doc.id);
    this.filteredDocuments = this.filteredDocuments.filter(d => d.id !== doc.id);
    this.documentsRacine = this.documentsRacine.filter(d => d.id !== doc.id);

    // Optionnel : si tu veux tout recharger proprement
    // this.getActiveDocuments();
  },
  (error) => {
    console.error('❌ Erreur lors de l\'archivage du document:', doc.id, error);
  }
);
  }
    ajouterDossier(dossier: Dossier | null): void {
    if (!dossier?.projet?.id) return;
    const parentId = dossier.id;
    const projetId = dossier.projet.id;
    const url = parentId
      ? `/dossiers-documents/projets/${projetId}/create-dossier/parent/${parentId}`
      : `/dossiers-documents/projets/${projetId}/create-dossier`;
    this.router.navigateByUrl(url);
  }
  ajouterDocument(dossier: Dossier): void {
    if (!dossier?.id || !dossier.projet?.id) {
      console.error('❌ Dossier ou projet non trouvé');
      return;
    }
  
    // Si le dossier a un parent, naviguer vers la page de création de document sous ce sous-dossier
    this.router.navigate([
      `/dossiers/projets/${dossier.projet.id}/dossiers/${dossier.id}/documents/create-document`
    ]);
  }
  
    closeDocumentContent(): void {
    this.selectedDocument = null;
    this.showDocumentContent = false;
    this.documentError = null;
  }
  closeDossierDetails(): void {
    this.showDossierDetails = false;
    this.selectedDossierDetails = null;
  }

openDocumentPopup(document: any): void {
    this.dialog.open(DocumentModalComponent, {
      width: '80%',
      data: document
    });
  }

  voirDetails(dossier: Dossier): void {
    this.selectedDossierDetails = dossier;
    this.showDossierDetails = true;
  }
archiverDossier(dossier: Dossier): void {
  const currentUser = this.authService.getUserInfo();
  const currentUserId = currentUser?.id;

  if (!currentUserId) {
    console.error('❌ Utilisateur non authentifié.');
    return;
  }

  // Archiver le dossier principal
  this.dossierService.archiveDossier(dossier.id, currentUserId).subscribe(
    () => {
      console.log('✅ Dossier principal archivé avec succès:', dossier.id);
      this.archiverSousDossiers(dossier); // Archiver tous les sous-dossiers
      this.archiverDocuments(dossier);    // Archiver tous les documents
      this.getActiveDossiers(); // Rafraîchir la liste des dossiers après archivage
    },
    (error) => {
      console.error('❌ Erreur lors de l\'archivage du dossier principal:', dossier.id, error);
    }
  );
}
archiverSousDossiers(dossier: Dossier): void {
  if (dossier.subDossiers && dossier.subDossiers.length > 0) {
    dossier.subDossiers.forEach(subDossier => {
      this.dossierService.archiveDossier(subDossier.id, this.authService.getUserInfo()?.id!).subscribe(
        () => {
          console.log('✅ Sous-dossier archivé avec succès:', subDossier.id);
          this.archiverSousDossiers(subDossier); // Appel récursif pour les sous-sous-dossiers
          this.archiverDocuments(subDossier);    // Archiver les documents sous ce sous-dossier
        },
        (error) => {
          console.error('❌ Erreur lors de l\'archivage du sous-dossier:', subDossier.id, error);
        }
      );
    });
  }
}

// Méthode pour archiver les documents d'un dossier
archiverDocuments(dossier: Dossier): void {
  if (dossier.documents && dossier.documents.length > 0) {
    dossier.documents.forEach((document: any) => {
      if (document && document.id !== null) {
        this.documentService.archiveDocument(document.id).subscribe(
          () => {
            console.log('✅ Document archivé avec succès:', document.id);
          },
          (error) => {
            console.error('❌ Erreur lors de l\'archivage du document:', document.id, error);
          }
        );
      } else {
        console.error('❌ Document sans id:', document);
      }
    });
  }
}

  // Autres méthodes (voirDetails, archiverDossier, etc.) restent identiques
}