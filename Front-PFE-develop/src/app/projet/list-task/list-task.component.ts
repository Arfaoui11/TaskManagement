import { Component } from '@angular/core';
import { Tache } from '../../models/tache.models';
import { TacheService } from '../../services/tache.service';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service';
import { Projet } from '../../models/projet.models';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-list-task',
  templateUrl: './list-task.component.html',
  styleUrls: ['./list-task.component.css'],
})
export class ListTaskComponent {
  projets: Projet[] = [];
  selectedProjetId: number | null = null;
  taches: Tache[] = [];
  projet: Projet;
  newTitre: string = '';
  showCreateForm: boolean = false;
  showEditForm: boolean = false;
  showAddCollaboratorModal: boolean = false;
  emailCollaborateur: string = '';
  message: string = '';
  currentUserId: number | null = null;
  showUpdateTaskModal = false;
  taskToUpdate: any = null;  // ou type spécifique Task selon ton modèle

  tacheForm: Partial<Tache> = {
    titre: '',
    description: '',
    statut: 'EN_ATTENTE',
    priorite: 'NORMALE',
  };

  tache: Tache;
  showUpdateModal: boolean = false;
  tacheToUpdate: Partial<Tache>;

  constructor(
    private taskService: TacheService,
    private projectService: ProjetService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.projectService.getProjets().subscribe((data) => {
      this.projets = data;
    });

    this.getCurrentUserId();

    this.route.params.subscribe((params) => {
      const projetIdFromUrl = params['projetId'];
      if (projetIdFromUrl) {
        this.selectedProjetId = +projetIdFromUrl;
        this.loadTasks();
      } else {
        this.selectedProjetId = null;
        this.taches = [];
      }
    });
  }

  getCurrentUserId(): void {
    const user = this.authService.getUserInfo();
    if (user) {
      console.log('Utilisateur trouvé dans getCurrentUserId :', user); // 🔍 Debug
      this.currentUserId = user.id;
    } else {
      console.error('Utilisateur non connecté ou session expirée.');
    }
  }

  onTaskClick(tache: Tache): void {
    this.router.navigate(['/update-task', tache.id]);
  }

  onTaskDelete(tacheId: number): void {
    this.taskService.delete(tacheId).subscribe(() => {
      this.taches = this.taches.filter((t) => t.id !== tacheId);
    });
  }

onProjetChange(): void {
  if (this.selectedProjetId) {
    this.router.navigate(['/list-task', this.selectedProjetId]);
  } else {
    this.router.navigate(['/list-task']);
  }
  this.loadTasks();
}
ajouterTacheRapide(): void {
  console.log('currentUserId au moment de la création de la tâche :', this.currentUserId);
  if (this.newTitre.trim() && this.currentUserId !== null) {
    const nouvelleTache: Tache = {
      titre: this.newTitre,
      projet: this.selectedProjetId ? { id: this.selectedProjetId } : undefined,
      responsable: this.currentUserId,
      statut: 'EN_ATTENTE',
      priorite: 'NORMALE',
    } as Tache;

    this.taskService.create(nouvelleTache).subscribe((tache) => {
      this.taches.push(tache);
      this.newTitre = '';
    });
  }
}

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.tacheForm = { titre: '', description: '', statut: 'EN_ATTENTE', priorite: 'NORMALE' };
    }
  }

  openAddCollaboratorModal(): void {
    this.showAddCollaboratorModal = true;
    this.message = '';
  }

  closeModal(): void {
    this.showAddCollaboratorModal = false;
    this.emailCollaborateur = '';
    this.message = '';
  }

  addCollaboratorByEmail(): void {
    if (this.emailCollaborateur.trim() && this.selectedProjetId) {
      this.userService.getUserByEmail(this.emailCollaborateur).subscribe({
        next: (user: User) => {
          if (user.activated) {
            const projetSelectionne = this.projets.find((p) => p.id === this.selectedProjetId);

            if (!projetSelectionne) {
              this.message = 'Projet non trouvé.';
              return;
            }

            if (!projetSelectionne.userIds) {
              projetSelectionne.userIds = [];
            }

            if (!projetSelectionne.userIds.includes(user.id)) {
              projetSelectionne.userIds.push(user.id);
            }

            this.projectService.affecterUtilisateurs(
              this.selectedProjetId!,
              projetSelectionne.userIds
            ).subscribe({
              next: () => {
                this.message = 'Collaborateur activé ajouté avec succès.';
                this.closeModal();
              },
              error: () => {
                this.message = 'Erreur lors de l’ajout au projet.';
              },
            });
          } else {
            this.message = 'Cet utilisateur n’est pas encore activé.';
          }
        },
        error: () => {
          this.message = 'Aucun utilisateur trouvé avec cet email.';
        },
      });
    }
  }

  ajouterTacheDetaillee(): void {
  if (this.tacheForm.titre?.trim() && this.currentUserId !== null) {
    const tacheAEnvoyer: Tache = {
      ...this.tacheForm,
      responsable: this.currentUserId,
      projet: this.selectedProjetId ? { id: this.selectedProjetId } as Projet : undefined,
      dateDebut: this.tacheForm.dateDebut,
      dateFin: this.tacheForm.dateFin,
    } as Tache;

    this.taskService.create(tacheAEnvoyer).subscribe((tacheCree) => {
      this.taches.push(tacheCree);
      this.tacheForm = {
        titre: '',
        description: '',
        statut: 'EN_ATTENTE',
        priorite: 'NORMALE',
      };
      this.showCreateForm = false;
    });
  }
}

  addCollaboratorToProject(user: User): void {
    const projetSelectionne = this.projets.find((p) => p.id === this.selectedProjetId);
    if (!projetSelectionne) {
      this.message = 'Projet non trouvé.';
      return;
    }
    if (!projetSelectionne.userIds) {
      projetSelectionne.userIds = [];
    }
    if (!projetSelectionne.userIds.includes(user.id)) {
      projetSelectionne.userIds.push(user.id);
    }
    this.projectService.affecterUtilisateurs(this.selectedProjetId!, projetSelectionne.userIds).subscribe({
      next: () => {
        this.message = 'Collaborateur activé ajouté avec succès.';
        this.closeModal();
      },
      error: () => {
        this.message = 'Erreur lors de l’ajout au projet.';
      },
    });
  }
navigateToCalendar(): void {
  if (this.selectedProjetId) {
    this.router.navigate(['/calendar'], { queryParams: { projetId: this.selectedProjetId } });
  } else {
    this.router.navigate(['/calendar']);
  }
}

  openUpdateTaskModal(tache: any) {
    this.taskToUpdate = { ...tache }; // clone la tâche pour éviter d’écraser directement
    this.showUpdateTaskModal = true;
  }

  closeUpdateTaskModal() {
    this.showUpdateTaskModal = false;
    this.taskToUpdate = null;
  }

 submitUpdateTask() {
  if (!this.taskToUpdate || !this.taskToUpdate.id) return;

  const updatedTask: Partial<Tache> = {
    id: this.taskToUpdate.id,
    titre: this.taskToUpdate.titre,
    description: this.taskToUpdate.description || '',
    commentaires: this.taskToUpdate.commentaires || '',
    statut: this.taskToUpdate.statut || 'EN_ATTENTE',
    priorite: this.taskToUpdate.priorite || 'NORMALE',
    // Convert null to undefined for date fields
    dateDebut: this.taskToUpdate.dateDebut ? new Date(this.taskToUpdate.dateDebut) : undefined,
    dateFin: this.taskToUpdate.dateFin ? new Date(this.taskToUpdate.dateFin) : undefined,
    tempsEstime: this.taskToUpdate.tempsEstime ?? 0,
    tempsPasse: this.taskToUpdate.tempsPasse ?? 0,
    responsable: this.taskToUpdate.responsable ?? null,
    projet: this.taskToUpdate.projet || null,
    categorie: this.taskToUpdate.categorie || '',
  };

  // Cast to Tache since we know id is defined
  this.taskService.update(updatedTask.id!, updatedTask as Tache).subscribe({
    next: () => {
      this.closeUpdateTaskModal();
      this.loadTasks();
    },
    error: (err) => {
      console.error('Erreur mise à jour tâche', err);
    }
  });
}

formatStatut(statut: string): string {
  switch (statut) {
    case 'EN_ATTENTE': return 'En attente';
    case 'EN_COURS': return 'En cours';
    case 'TERMINEE': return 'Terminée';
    default: return statut;
  }
}

formatPriorite(priorite: string): string {
  switch (priorite) {
    case 'BASSE': return 'Basse';
    case 'NORMALE': return 'Normale';
    case 'HAUTE': return 'Haute';
    default: return priorite;
  }
}

loadTasks(): void {
  function toDateFromArray(arr: number[]): Date | null {
    if (!arr || !Array.isArray(arr) || arr.length < 3) {
      return null;
    }
    
    const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
    
    // Validate the date components
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    const date = new Date(year, month - 1, day, hour, minute, second);
    
    // Check if the created date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }

  const convertDates = (taches: any[]) => {
    return taches.map(tache => {
      // Convert array dates to Date objects or keep existing dates
      tache.dateDebut = Array.isArray(tache.dateDebut) 
        ? toDateFromArray(tache.dateDebut) 
        : (tache.dateDebut ? new Date(tache.dateDebut) : null);
      
      tache.dateFin = Array.isArray(tache.dateFin) 
        ? toDateFromArray(tache.dateFin) 
        : (tache.dateFin ? new Date(tache.dateFin) : null);
      
      tache.createdAt = Array.isArray(tache.createdAt) 
        ? toDateFromArray(tache.createdAt) 
        : (tache.createdAt ? new Date(tache.createdAt) : null);
      
      tache.updatedAt = Array.isArray(tache.updatedAt) 
        ? toDateFromArray(tache.updatedAt) 
        : (tache.updatedAt ? new Date(tache.updatedAt) : null);
      
      return tache;
    });
  };

  if (this.selectedProjetId) {
    this.taskService.getTachesByProjetId(this.selectedProjetId).subscribe({
      next: (data) => {
        this.taches = convertDates(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tâches', err);
      }
    });
  } else {
    this.taskService.getAll().subscribe({
      next: (data) => {
        this.taches = convertDates(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de toutes les tâches', err);
      }
    });
  }
}
}
