import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { Projet } from '../../models/projet.models';

@Component({
  selector: 'app-update-projet',
  templateUrl: './update-projet.component.html',
  styleUrls: ['./update-projet.component.css']
})
export class UpdateProjetComponent implements OnInit {
  projetId: number | null = null;
  projet: Projet = {} as Projet; // Initialisation d'un objet vide
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du projet depuis l'URL
    const idParam = this.route.snapshot.paramMap.get('projetId');
    console.log("ID récupéré depuis l'URL :", idParam);

    if (idParam) {
      this.projetId = +idParam;
      if (isNaN(this.projetId)) {
        console.error("ID invalide :", idParam);
        this.errorMessage = "ID du projet invalide.";
      } else {
        this.loadProjet();
      }
    } else {
      console.error("Aucun ID trouvé dans l'URL.");
      this.errorMessage = "Impossible de récupérer l'ID du projet.";
    }
  }

  loadProjet(): void {
    if (!this.projetId) {
      console.error("Tentative de chargement avec un ID invalide :", this.projetId);
      return;
    }

    this.isLoading = true;
    console.log("Chargement du projet avec l'ID :", this.projetId);

    this.projetService.getProjet(this.projetId).subscribe({
      next: (data) => {
        console.log("Projet chargé avec succès :", data);
        this.projet = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur lors du chargement du projet :", error);
        this.errorMessage = 'Échec du chargement des données du projet';
        this.isLoading = false;
      }
    });
  }

  updateProjet(): void {
    if (!this.projetId) {
      console.error("Tentative de mise à jour avec un ID invalide :", this.projetId);
      return;
    }

    console.log("Données envoyées pour mise à jour :", this.projet);

    this.isLoading = true;
    this.projetService.updateProjet(this.projetId, this.projet).subscribe({
      next: () => {
        console.log("Projet mis à jour avec succès !");
        this.router.navigate(['/projets']); // Redirection après mise à jour
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour du projet :", error);
        this.errorMessage = 'Erreur lors de la mise à jour du projet';
        this.isLoading = false;
      }
    });
  }

  cancelUpdate(): void {
    console.log("Annulation de la mise à jour, retour à la liste des projets.");
    this.router.navigate(['/projets']); // Redirection sans modification
  }
}
