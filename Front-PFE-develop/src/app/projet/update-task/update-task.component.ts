import { Component } from '@angular/core';
import { Tache } from '../../models/tache.models';
import { ActivatedRoute, Router } from '@angular/router';
import { TacheService } from '../../services/tache.service';

@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  styleUrls: ['./update-task.component.css']
})
export class UpdateTaskComponent {
  task: Tache = {} as Tache;  // Modèle de la tâche à mettre à jour
  taskId: number;  // ID de la tâche à mettre à jour
  loading: boolean = false;  // État de chargement
  message: string = '';  // Message de succès ou d'erreur
  showModal: boolean = false;  // État d'affichage de la modale

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TacheService  // Service pour gérer les tâches
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de la tâche à partir des paramètres de l'URL
    this.route.params.subscribe(params => {
      this.taskId = +params['id'];  // Convertir en nombre
      this.loadTask();  // Charger la tâche
    });
  }

  loadTask() {
    this.loading = true;
    this.taskService.getById(this.taskId).subscribe(
      (task: Tache) => {
        this.task = task;  // Remplir le formulaire avec les données récupérées
        this.loading = false;
        this.showModal = true;  // Ouvrir la modale après avoir chargé la tâche
      },
      (error) => {
        this.message = 'Erreur de chargement de la tâche';
        this.loading = false;
      }
    );
  }

  updateTask() {
    this.loading = true;
    this.taskService.update(this.task.id, this.task).subscribe(
      (response) => {
        this.message = 'Tâche mise à jour avec succès!';
        this.loading = false;
        this.router.navigate(['/list-task', this.task.projet?.id]);
      },
      (error) => {
        this.message = 'Erreur lors de la mise à jour de la tâche';
        this.loading = false;
      }
    );
  }

  closeModal() {
    this.showModal = false;  // Fermer la modale
    this.router.navigate(['/list-task', this.task.projet?.id]);
  }
}
