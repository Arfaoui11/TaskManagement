import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Projet } from '../../models/projet.models';
import { ProjetService } from '../../services/projet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-projet',
  templateUrl: './create-projet.component.html',
  styleUrls: ['./create-projet.component.css']
})
export class CreateProjetComponent implements OnInit {
  @Output() projetCreated = new EventEmitter<Projet>();
  @Output() closeModal = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';
  userId: any;
  projet: Projet;

  constructor(private projetService: ProjetService, private router: Router) {}

  ngOnInit(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData.id;
    }

    // Initialize the projet object after userId is set
    this.projet = {
      title: '',
      description: '',
      id: 0,
      createdAt: '',
      updatedAt: null,
      archived: false,
      userIds: [],
      createdBy: this.userId,
 // Assign userId here
    };
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
              this.router.navigate(['/projets']); // Redirection après mise à jour

      return;
      
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.projetService.createProjet(this.projet).subscribe({
      next: (response) => {
        this.projetCreated.emit(response);
        form.resetForm();
        this.closeModal.emit();
        this.router.navigate(['/projets']); // Redirection après mise à jour
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors de la création du projet';
        console.error('Erreur lors de la création du projet :', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

onCancel() {
  this.router.navigate(['/projets']); // Redirection simple
}
}
