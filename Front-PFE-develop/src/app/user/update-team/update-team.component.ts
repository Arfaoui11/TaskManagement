import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-update-team',
  templateUrl: './update-team.component.html',
  styleUrls: ['./update-team.component.css']
})
export class UpdateTeamComponent implements OnInit {
  teamId!: number;
  team: Team = {
    name: '', users: [],
    id: 0
  };
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router, // ⬅ Modifier "private" en "public"
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTeam();
  }

  // Charger les infos de l'équipe à modifier
  loadTeam(): void {
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'équipe :', err);
        alert('Impossible de charger l\'équipe.');
        this.router.navigate(['/teams']);
      }
    });
  }

  // Mettre à jour l'équipe
  updateTeam(): void {
    this.teamService.updateTeam(this.teamId, {
      name: this.team.name,
      id: 0,
      users: []
    }).subscribe({
      next: () => {
        alert('Équipe mise à jour avec succès !');
        this.router.navigate(['/teams']);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour :', err);
        alert('Une erreur est survenue.');
      }
    });
  }
}
