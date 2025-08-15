import { Component, OnInit } from '@angular/core';
import { Projet } from '../../models/projet.models';
import { ProjetService } from '../../services/projet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Team } from '../../models/team.model';
import { TeamService } from '../../services/team.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-projet-list',
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css']
})
export class ProjetListComponent implements OnInit {
  projets: Projet[] = [];
  showEditPopup = false;
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  openedDropdown: string | null = null;
  selectedProjet: any;
teamMembers: { [teamId: number]: User[] } = {};

  showAssignTeamModal = false;
  selectedTeamId: number | null = null;
  teams: Team[] = [];
  confirmTitle = '';
  confirmMessage = '';
  pendingAction: {
    action: 'archive' | 'delete' | 'restore',
    projetId: number
  } | null = null;
  projetId: number;

  constructor(
    private projetService: ProjetService,
    private teamService: TeamService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProjets();
    this.loadTeams();
    this.projetId = +this.route.snapshot.paramMap.get('projetId')!;
  }

  loadProjets() {
    this.loading = true;
    this.clearMessages();

    this.projetService.getActiveProjets().subscribe({
      next: (data) => {
        this.projets = data;
        this.loading = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement des projets');
        this.loading = false;
      }
    });
  }
loadTeamMembers(teamId: number) {
  // Ne pas recharger si déjà chargé
  if (this.teamMembers[teamId]) return;

  this.teamService.getUsersByTeamId(teamId).subscribe({
    next: (users) => {
      this.teamMembers[teamId] = users;
    },
    error: () => {
      this.showError('Erreur lors du chargement des membres de l\'équipe');
    }
  });
}

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (data: Team[]) => {
        this.teams = data;
      },
      error: () => {
        this.showError("Erreur lors du chargement des équipes");
      }
    });
  }

  assignTeam(projetId: number, teamId: number): void {
    this.projetService.assignTeamToProject(projetId, teamId).subscribe({
      next: (data) => {
        this.successMessage = 'Équipe affectée avec succès';
        this.loadProjets();
        this.closeAssignTeamModal();
      },
      error: (err) => {
        this.showError('Erreur lors de l\'affectation de l\'équipe');
      }
    });
  }
openAssignTeamModal(projet: any) {
  console.log('Projet reçu:', projet);
  this.selectedProjet = projet;
  this.selectedTeamId = projet.teamId || null;  // teamId probablement undefined
  this.showAssignTeamModal = true;

  if (this.selectedTeamId !== null) {
    this.loadTeamMembers(this.selectedTeamId);
  }
}




  closeAssignTeamModal() {
    this.showAssignTeamModal = false;
    this.selectedProjet = null;
    this.selectedTeamId = null;
  }

  onAssignTeam() {
    if (this.selectedProjet && this.selectedTeamId !== null) {
      this.assignTeam(this.selectedProjet.id, this.selectedTeamId);
    }
  }

  onCreateProjet() {
    this.router.navigate(['/create-projet']);
  }

  onViewProjetDetails(projetId: number) {
    this.router.navigate(['/dossiers-documents/projets', projetId]);
  }

  toggleDropdown(projetId: string) {
    this.openedDropdown = this.openedDropdown === projetId ? null : projetId;
  }

  confirmArchive(projetId: number) {
    this.pendingAction = { action: 'archive', projetId };
    this.confirmTitle = 'Archiver le projet';
    this.confirmMessage = 'Êtes-vous sûr de vouloir archiver ce projet ?';
  }

  confirmDelete(projetId: number) {
    this.pendingAction = { action: 'delete', projetId };
    this.confirmTitle = 'Supprimer le projet';
    this.confirmMessage = 'Êtes-vous sûr de vouloir supprimer définitivement ce projet ?';
  }

  confirmRestore(projetId: number) {
    this.pendingAction = { action: 'restore', projetId };
    this.confirmTitle = 'Restaurer le projet';
    this.confirmMessage = 'Êtes-vous sûr de vouloir restaurer ce projet ?';
  }

  onConfirmAction() {
    if (!this.pendingAction) return;

    const { action, projetId } = this.pendingAction;
    this.toggleDropdown(projetId.toString());

    switch (action) {
      case 'archive':
        this.executeArchive(projetId);
        break;
      case 'delete':
        this.executeDelete(projetId);
        break;
      case 'restore':
        this.executeRestore(projetId);
        break;
    }

    this.pendingAction = null;
  }

  onConfirmCancel() {
    this.pendingAction = null;
  }

  private executeArchive(projetId: number) {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.id) {
      this.showError('Utilisateur non authentifié');
      return;
    }

    this.projetService.archiveProjet(projetId, userInfo.id).subscribe({
      next: () => {
        this.showSuccess('Projet archivé avec succès');
        this.loadProjets();
      },
      error: () => {
        this.showError('Vous n\'avez pas l\'accès pour archiver le projet');
      }
    });
  }

  private executeDelete(projetId: number) {
    this.projetService.deleteProjet(projetId).subscribe({
      next: () => {
        this.showSuccess('Projet supprimé avec succès');
        this.loadProjets();
      },
      error: () => {
        this.showError('Échec de la suppression du projet');
      }
    });
  }

  private executeRestore(projetId: number) {
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.id) {
      this.showError('Utilisateur non authentifié');
      return;
    }

    this.projetService.restoreProjet(projetId, userInfo.id).subscribe({
      next: () => {
        this.showSuccess('Projet restauré avec succès');
        this.loadProjets();
      },
      error: () => {
        this.showError('Échec de la restauration du projet');
      }
    });
  }
  
onProjectDoubleClick(projet: Projet) {
    this.onViewProjetDetails(projet.id);  // Appeler la méthode pour naviguer vers les dossiers/documents
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

  openEditPopup(projet: Projet) {
    this.router.navigate(['/update-projet', projet.id]);
  }
}
