import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../models/projet.models';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = 'http://localhost:8000/api1/projets';

  constructor(private http: HttpClient) { }

  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.apiUrl);
  }

  getProjet(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}`);
  }

  createProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.apiUrl, projet);
  }

  updateProjet(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/${id}`, projet);
  }

  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getArchivedProjets(currentUserId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/archived`);
  }

  getActiveProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/active`);
  }

  archiveProjet(id: number, userId: number): Observable<Projet> {
    return this.http.patch<Projet>(`${this.apiUrl}/${id}/archive/${userId}`, {});
  }

  restoreProjet(id: number, userId: number): Observable<Projet> {
    return this.http.patch<Projet>(`${this.apiUrl}/${id}/restore/${userId}`, {});
  }

  getUsersForProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/users`);
  }
  affecterUtilisateurs(projetId: number, userIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projetId}/affecter`, userIds);
  }
  assignTeamToProject(projetId: number, teamId: number): Observable<Projet> {
  const url = `${this.apiUrl}/${projetId}/assign-team/${teamId}`;
  return this.http.put<Projet>(url, {});
}
getTeamByIdWithMembers(teamId: number): Observable<Team> {
  return this.http.get<Team>(`http://localhost:8000/api2/projets/with-members/${teamId}`);
}
}
