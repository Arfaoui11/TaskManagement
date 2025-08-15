import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model'; // Adjust the import path for the User model
import { Role } from '../models/role.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class UserService {

  
  private apiUrl = `${environment.apiUrl}/users`; // Replace with your backend API URL

  constructor(private http: HttpClient) {}

  // Create a new user
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, user , httpOptions);
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}` , httpOptions);
  }

  // Get a user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}` , httpOptions);
  }

  // Update a user by ID
  updateUser(id: number, userDetails: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userDetails, httpOptions);
  }

  // Delete a user by ID
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}` , httpOptions);
  }

  // Assign a user to a team
  assignUserToTeam(userId: number, teamId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/team/${teamId}`, httpOptions);
  }

  // Remove a user from a team
  removeUserFromTeam(userId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/remove-team`, httpOptions);
  }

  // Assign a role to a user
  assignRoleToUser(userId: number, roleId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role/${roleId}`, httpOptions);
  }
  
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>('http://localhost:8080/api2/roles');  // Ajustez l'URL de votre API pour récupérer les rôles
  }
  // Activer un utilisateur
  inviteUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite`, user);
  }

  // Méthode pour activer un utilisateur
  activateUser(otp: string, activationToken: string) {
    const body = { "otp":otp, "activationToken":activationToken };
    return this.http.post(`${this.apiUrl}/activate`, body,httpOptions);
  }
  completeRegistration(userDetails: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/complete-registration`, userDetails);
  }
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }
  checkEmailExists(email: string) {
  return this.http.get<boolean>(`${this.apiUrl}/check-email?email=${email}`);
}

}