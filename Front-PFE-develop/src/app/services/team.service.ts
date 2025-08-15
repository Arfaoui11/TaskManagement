import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`;  // L'URL de votre API backend
  constructor(private http: HttpClient) { }

  createTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  // Ajouter un utilisateur à une équipe
  addUserToTeam(teamId: number, userId: number) {
    return this.http.put<Team>(`${this.apiUrl}/${teamId}/addUser/${userId}`, {}).pipe(
      tap((updatedTeam: any) => {
        console.log('User added to team', updatedTeam);
        // Optionally update local state or trigger refresh
      }),
      catchError((error: any) => {
        console.error('Error adding user to team', error);
        // Handle error appropriately
return throwError(() => error);
      })
    );
  }

  // Retirer un utilisateur d'une équipe
  // Modify the removeUserFromTeam method
removeUserFromTeam(teamId: number, userId: number): Observable<Team> {
  const url = `${this.apiUrl}/${teamId}/remove-user/${userId}`;
  return this.http.put<Team>(url, {}).pipe(
    tap((updatedTeam: Team) => {
      console.log('User removed from team', updatedTeam);
    }),
    catchError((error: any) => {
      console.error('Error removing user from team', error);
return throwError(() => error);
    })
  );
}

  // Récupérer une équipe par son ID
  getTeamById(teamId: number): Observable<Team> {
    const url = `${this.apiUrl}/${teamId}`;
    return this.http.get<Team>(url);
  }

  // Récupérer toutes les équipes
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  // Mettre à jour une équipe
  updateTeam(teamId: number, teamDetails: Team): Observable<Team> {
    const url = `${this.apiUrl}/${teamId}`;
    return this.http.put<Team>(url, teamDetails);
  }

  // Supprimer une équipe
  deleteTeam(teamId: number): Observable<void> {
    const url = `${this.apiUrl}/${teamId}`;
    return this.http.delete<void>(url);
  }

  // Ajouter plusieurs utilisateurs à une équipe
  addUsersToTeam(teamId: number, userIds: number[]): Observable<Team> {
    const url = `${this.apiUrl}/${teamId}/add-users`;
    return this.http.post<Team>(url, userIds);
  }

  // Récupérer les utilisateurs d'une équipe
  getUsersByTeamId(teamId: number): Observable<User[]> {
    const url = `${this.apiUrl}/${teamId}/users`;
    return this.http.get<User[]>(url);
  }
}

