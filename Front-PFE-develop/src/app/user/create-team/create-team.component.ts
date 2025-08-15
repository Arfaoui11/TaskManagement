import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.css']
})
export class CreateTeamComponent implements OnInit {
  teamForm: FormGroup;
  isPopupVisible = false;  // Variable pour contrôler l'affichage du pop-up

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {}

  // Ouvrir le pop-up
  openCreateTeamPopup(): void {
    this.isPopupVisible = true;
  }

  // Fermer le pop-up
  closePopup(): void {
    this.isPopupVisible = false;
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.teamForm.invalid) {
      return;
    }

    const newTeam: Team = {
      name: this.teamForm.value.name,
      id: 0,
      users: []
    };

    this.teamService.createTeam(newTeam).subscribe({
      next: () => {
        alert('Équipe créée avec succès !');
        this.closePopup();  // Fermer la modale après soumission
        this.teamForm.reset();
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'équipe :', err);
        alert('Une erreur est survenue lors de la création de l\'équipe.');
      }
    });
  }
}
