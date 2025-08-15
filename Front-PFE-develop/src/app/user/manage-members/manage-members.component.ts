import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { Team } from '../../models/team.model';
import { Gender, User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.css']
})
export class ManageMembersComponent implements OnInit {
  teamId: number;  // L'ID de l'équipe doit être un number
  team: Team = {
    name: '', users: [],
    id: 0
  };
  allUsers: User[] = [];
  isLoading = true;
  roles: Role[] = [];

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Convertir l'ID en nombre
    this.teamId = +this.route.snapshot.paramMap.get('id')!;  // Utilisation de l'opérateur '+' pour convertir en number
    console.log(`Team ID loaded: ${this.teamId}`);
    this.loadTeam();
    this.loadUsers();
  }

  loadTeam(): void {
    console.log('Loading team...');
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        console.log('Team loaded:', data);
        this.team = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'équipe:', err);
        this.isLoading = false;
      }
    });
  }
  
  loadUsers(): void {
    console.log('Loading all users...');
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        console.log('All users loaded:', data);
        this.allUsers = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    });
  }

  // Méthode pour vérifier si un utilisateur est déjà membre de l'équipe
  isMember(userId: number): boolean {
    const isUserMember = this.team.users.some(user => user.id === userId);
    console.log(`Checking if user ${userId} is a member: ${isUserMember}`);
    return isUserMember;
  }

  addMember(userId: number): void {
    this.teamService.addUserToTeam(this.teamId, userId).subscribe({
      next: (updatedTeam) => {
        console.log('User added successfully');
        this.team = updatedTeam;  // Update entire team object
        this.loadTeam();  // Reload to ensure consistency
      },
      error: (err) => {
        console.error('Failed to add user', err);
        // Revert local changes if needed
      }
    });
  }
  
  removeMember(userId: number): void {
    this.teamService.removeUserFromTeam(this.teamId, userId).subscribe({
      next: (updatedTeam) => {
        console.log('User removed successfully');
        this.team = updatedTeam;  // Update entire team object
        this.loadTeam();  // Reload to ensure consistency
      },
      error: (err) => {
        console.error('Failed to remove user', err);
        // Revert local changes if needed
      }
    });
  }
  
  updateTeam(): void {
    console.log('Updating team with the following users:', this.team.users);
    this.teamService.updateTeam(this.teamId, this.team).subscribe({
      next: (updatedTeam) => {
        console.log('Team updated successfully with users:', updatedTeam);
        alert('Membres de l\'équipe mis à jour avec succès!');
        this.loadTeam();  // Recharger l'équipe après mise à jour pour obtenir les données les plus récentes
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de l\'équipe:', err);
        alert('Une erreur est survenue.');
      }
    });
  }
  


  cancel(): void {
    console.log('Cancelling and navigating back to teams list.');
    this.router.navigate(['/teams']);
  }
}
