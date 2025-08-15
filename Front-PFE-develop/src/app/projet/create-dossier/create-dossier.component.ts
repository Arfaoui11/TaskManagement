import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DossierService } from '../../services/dossier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Dossier } from '../../models/dossier.models';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Projet } from '../../models/projet.models';
import { ProjetService } from '../../services/projet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-dossier',
  templateUrl: './create-dossier.component.html',
  styleUrls: ['./create-dossier.component.css'],
})
export class CreateDossierComponent implements OnInit {
  dossierForm: FormGroup;
  projetId: any;
  projet!: Projet;
  users: User[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  parentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dossierService: DossierService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private projetService: ProjetService
  ) {
    // On initialise le formulaire sans parentId pour l'instant
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.id) {
      this.showError('Utilisateur non authentifié');
      return;
    }
    const userId = userInfo.id;

    this.dossierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      userId,
      createdAt: [new Date().toISOString()],
      documents: [[]],
      parentId: [null] // On l'initialise à null et on le mettra à jour dans ngOnInit
    });
  }

  showError(message: string) {
    this.errorMessage = message;
    console.error(message);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.projetId = params.get('projetId');
      this.parentId = params.get('parentId');
  
      console.log('[ngOnInit] projetId reçu de l\'URL :', this.projetId);
      console.log('[ngOnInit] parentId reçu de l\'URL :', this.parentId);
  
      // Important: on met à jour le formulaire avec le parentId
      if (this.parentId) {
        // Assurez-vous que parentId est une string et pas null
        this.dossierForm.get('parentId')?.setValue(this.parentId);
        console.log('[ngOnInit] Formulaire MAJ avec parentId :', this.dossierForm.get('parentId')?.value);
      }
  
      const userInfo = this.authService.getUserInfo();
      if (!userInfo || !userInfo.id) {
        this.errorMessage = 'Utilisateur non authentifié';
        return;
      }
  
      this.dossierForm.get('userId')?.setValue(userInfo.id);
      console.log('[ngOnInit] Formulaire MAJ avec userId :', userInfo.id);
  
      // Chargement du projet
      if (this.projetId) {
        this.projetService.getProjet(this.projetId).subscribe(
          (projet) => {
            this.projet = projet;
            console.log('[ngOnInit] Projet chargé :', projet);
          },
          (err) => {
            console.error('[ngOnInit] Erreur chargement projet :', err);
            this.errorMessage = 'Erreur de chargement du projet';
          }
        );
      }
  
      // Chargement des utilisateurs
      this.userService.getAllUsers().subscribe(
        (users) => {
          this.users = users;
          console.log('[ngOnInit] Utilisateurs chargés :', users.length);
        },
        (err) => {
          console.error('[ngOnInit] Erreur chargement users :', err);
        }
      );
    });
  }
  
  onSubmit() {
    console.log("[onSubmit] Valeurs du formulaire avant soumission :", this.dossierForm.value);

    if (this.dossierForm.invalid) {
      console.error("[onSubmit] Formulaire invalide :", this.dossierForm.errors);
      return;
    }

    // Assurons-nous que le parentId est bien inclus dans l'objet dossier
    const dossier: Dossier = {
      ...this.dossierForm.value,
      parentId: this.dossierForm.get('parentId')?.value || null
    };

    console.log("[onSubmit] Dossier à créer avec parentId :", dossier.parentId);
    console.log("[onSubmit] Dossier complet à créer :", dossier);

    if (this.projetId) {
      this.dossierService.createDossier(dossier, this.projetId, dossier.parentId).subscribe(
        (response) => {
          console.log("[onSubmit] Dossier créé avec succès :", response);
          this.router.navigate(['dossiers-documents/projets', this.projetId]);
        },
        (error) => {
          console.error("[onSubmit] Erreur lors de la création du dossier :", error);
          this.errorMessage = 'Erreur lors de la création du dossier.';
        }
      );
    } else {
      this.errorMessage = 'ID du projet manquant';
    }
  }

  onCancel() {
    if (this.projetId) {
            this.router.navigate(['dossiers-documents/projets/', this.projetId]);

    } else {
      this.router.navigate(['/']);
    }
  }
}