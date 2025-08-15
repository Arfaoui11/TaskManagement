import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  isLoading: boolean = true;
  isPopupOpen: boolean = false;
  newTeamName: string = '';

  constructor(private teamService: TeamService, private router: Router) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        console.log('Données reçues :', data);
        this.teams = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des équipes :', err);
        this.isLoading = false;
      },
    });
  }

  openPopup(): void {
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.newTeamName = ''; 
  }

  createTeam(): void {
    if (this.newTeamName.trim() !== '') {
      const newTeam: Team = {
        name: this.newTeamName, id: 0,
        users: []
      };
      this.teamService.createTeam(newTeam).subscribe({
        next: (createdTeam) => {
          this.teams.push(createdTeam);
          this.closePopup();
          alert('Équipe créée avec succès !');
        },
        error: (err) => {
          console.error("Erreur lors de la création de l'équipe :", err);
          alert("Une erreur est survenue lors de la création de l'équipe.");
        },
      });
    }
  }

  editTeam(teamId: number): void {
    this.router.navigate(['update-team', teamId]);
  }

  manageUsers(teamId: number): void {
    this.router.navigate(['/teams', teamId, 'manage-members']);
  }

  deleteTeam(teamId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.teams = this.teams.filter((team) => team.id !== teamId);
          alert('Équipe supprimée avec succès !');
        },
        error: (err) => {
          console.error("Erreur lors de la suppression de l'équipe :", err);
          alert("Une erreur est survenue lors de la suppression de l'équipe.");
        },
      });
    }
  }
}
