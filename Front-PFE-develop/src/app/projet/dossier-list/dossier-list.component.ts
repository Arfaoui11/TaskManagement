import { Component, OnInit, HostListener } from '@angular/core';
import { Dossier } from '../../models/dossier.models';
import { DossierService } from '../../services/dossier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { catchError, forkJoin, of } from 'rxjs';

const emptyDossier = (): Dossier => ({
  id: 0,
  name: '',
  createdAt: '',
  archived: false,
  userId: 0,
  parentId: 0,
  subDossiers: []
});

@Component({
  selector: 'app-dossier-list',
  templateUrl: './dossier-list.component.html',
  styleUrls: ['./dossier-list.component.css']
})
export class DossierListComponent implements OnInit {
  dossiers: Dossier[] = [];
  projetId!: number;
  loading = true;
  users: { [userId: number]: User } = {};
  errorMessage: string | null = null;
  successMessage: string | null = null;
  currentUserId: number | null = null;

  // UI Controls
  openedDropdown: number | null = null;
  showDetailsPopup = false;
  showEditPopup = false;
  showConfirmPopup = false;
  selectedDossier: Dossier = emptyDossier();
  confirmTitle = '';
  confirmMessage = '';
  pendingAction: { 
    action: 'delete' | 'archive', 
    dossierId: number 
  } | null = null;

  constructor(
    private dossierService: DossierService,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.modal-overlay')) {
      this.closeDropdown();
    }
  }

  ngOnInit() {
    this.projetId = +this.route.snapshot.paramMap.get('projetId')!;
    const userInfo = this.authService.getUserInfo();
    
    if (!userInfo) {
      this.showError('Veuillez vous connecter');
      this.router.navigate(['/login']); // Redirige vers la page de connexion
      return;
    }
    
    this.currentUserId = userInfo.id;
    this.loadDossiers();
  }

  private clearMessages() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.clearMessages(), 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.clearMessages(), 5000);
  }

 loadDossiers() {
  // Validate project ID
  if (!this.projetId) {
    this.showError('ID de projet invalide');
    return;
  }

  // Get current user info
  const userInfo = this.authService.getUserInfo();
  
  // Validate user authentication
  if (!userInfo || !userInfo.id) {
    this.showError('Utilisateur non authentifié');
    return;
  }

  // Prepare loading state
  this.loading = true;
  this.clearMessages();

  // Convert projetId to appropriate type (string or number based on service)
  const projetIdParam = typeof this.projetId === 'number' 
    ? this.projetId 
    : Number(this.projetId);

  // Call service method with project ID and optional user ID
  this.dossierService.getDossiersByProjetId(projetIdParam, userInfo.id).subscribe({
    next: (dossiers) => {
      // Process successful response
      this.dossiers = dossiers;
      this.loadUsersForDossiers(dossiers);
      this.loading = false;
    },
    error: (error) => {
      // Handle error scenario
      console.error('Erreur de chargement des dossiers:', error);
      this.showError('Erreur lors du chargement des dossiers');
      this.loading = false;
    }
  });
}

  loadUsersForDossiers(dossiers: Dossier[]): void {
    if (!dossiers || dossiers.length === 0) return;

    const uniqueUserIds = [...new Set(
      dossiers
        .filter(dossier => dossier.userId !== undefined && dossier.userId !== null)
        .map(dossier => dossier.userId)
    )];

    if (uniqueUserIds.length === 0) return;

    const userObservables = uniqueUserIds.map(userId => 
      this.userService.getUserById(userId).pipe(
        catchError(error => {
          console.error(`Erreur lors du chargement de l'utilisateur ${userId}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(userObservables).subscribe({
      next: (users: (User | null)[]) => {
        users.forEach(user => {
          if (user) {
            this.users[user.id] = user;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }
  onDossierDoubleClick(dossier: any): void {
    // Implement your desired action when a dossier is double-clicked
    console.log('Double-clicked on dossier:', dossier);
    
    // For example, you might want to open the dossier details:
    this.onViewDossierDetails(dossier.id);
  }
  // Dropdown Methods
  toggleDropdown(dossierId: number, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.openedDropdown = this.openedDropdown === dossierId ? null : dossierId;
  }

  closeDropdown(): void {
    this.openedDropdown = null;
  }

  // Dossier Actions
  openDetailsPopup(dossier: Dossier, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedDossier = { ...dossier };
    this.showDetailsPopup = true;
    this.closeDropdown();
  }

  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
    this.selectedDossier = emptyDossier();
  }

  openEditPopup(dossier: Dossier, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDossier = { ...dossier };
    this.showEditPopup = true;
    this.closeDropdown();
  }

  closeEditPopup(): void {
    this.showEditPopup = false;
    this.selectedDossier = emptyDossier();
  }

  onEditSubmit(): void {
    if (this.selectedDossier.id === 0) return;

    this.dossierService.updateDossier(this.selectedDossier.id, this.selectedDossier).subscribe({
      next: () => {
        this.showSuccess('Dossier modifié avec succès');
        this.closeEditPopup();
        this.loadDossiers();
      },
      error: (error) => {
        this.showError('Erreur lors de la modification du dossier');
      }
    });
  }

  confirmArchive(dossierId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.pendingAction = { action: 'archive', dossierId };
    this.confirmTitle = 'Archiver le dossier';
    this.confirmMessage = 'Êtes-vous sûr de vouloir archiver ce dossier ?';
    this.showConfirmPopup = true;
    this.closeDropdown();
  }

  confirmDelete(dossierId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.pendingAction = { action: 'delete', dossierId };
    this.confirmTitle = 'Supprimer le dossier';
    this.confirmMessage = 'Êtes-vous sûr de vouloir supprimer définitivement ce dossier ?';
    this.showConfirmPopup = true;
    this.closeDropdown();
  }

  onConfirmAction(): void {
    if (!this.pendingAction) return;

    const { action, dossierId } = this.pendingAction;

    switch (action) {
      case 'archive':
        this.executeArchive(dossierId);
        break;
      case 'delete':
        this.executeDelete(dossierId);
        break;
    }

    this.showConfirmPopup = false;
    this.pendingAction = null;
  }

  onConfirmCancel(): void {
    this.showConfirmPopup = false;
    this.pendingAction = null;
  }

  private executeArchive(dossierId: number): void {
    if (!this.currentUserId) {
      this.showError('Utilisateur non identifié');
      return;
    }

    this.dossierService.archiveDossier(dossierId, this.currentUserId).subscribe({
      next: () => {
        this.showSuccess('Dossier archivé avec succès');
        this.loadDossiers();
      },
      error: (error) => {
        this.showError('Erreur lors de l\'archivage du dossier');
      }
    });
  }

  private executeDelete(dossierId: number): void {
    this.dossierService.deleteDossier(dossierId).subscribe({
      next: () => {
        this.showSuccess('Dossier supprimé avec succès');
        this.loadDossiers();
      },
      error: (error) => {
        this.showError('Erreur lors de la suppression du dossier');
      }
    });
  }

  // Navigation Methods
  navigateToFullArchive(): void {
    this.router.navigate(['/projets', this.projetId, 'archieve']);
  }

  getCreatedByUserName(dossier: Dossier): string {
    if (dossier.userId !== undefined && this.users[dossier.userId]) {
      return this.users[dossier.userId].username;
    }
    return 'Inconnu';
  }

  onViewDossierDetails(dossierId: number): void {
    this.router.navigate(['/dossiers/projets', this.projetId, 'dossiers', dossierId, 'documents']);
  }

  onCreateDossier(): void {
    this.router.navigate(['/dossiers/projets', this.projetId, 'create-dossier']);
  }

  goBack(): void {
    this.router.navigate(['/projets']);
  }
}