import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../models/login-request';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Your backend API URL
  private currentUser: any;

  constructor(private http: HttpClient, private router: Router) {}

  // Login avec stockage du token
  // Dans votre AuthService
login(loginRequest: LoginRequest): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, loginRequest, httpOptions)
    .pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('access_token', response.token);
          
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
          
          // Stockez aussi les infos utilisateur si elles sont dans la réponse
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        }
      })
    );
}
  // Méthode pour récupérer le token (à utiliser dans ProjetService)
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Méthode pour récupérer le refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    // Ajouter l'email en tant que paramètre dans l'URL
    let params = new HttpParams().set('email', email);
    
    // Envoyer la requête POST avec le paramètre email
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, null, { params });
  }

  // Reset password    
  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    
    return this.http.post(`${this.apiUrl}/reset-password`, {}, { params });
  }
    
  // Refresh token
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    let params = new HttpParams().set('refreshToken', refreshToken || '');
    
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, { params })
      .pipe(
        tap(response => {
          if (response && response.accessToken) {
            localStorage.setItem('access_token', response.accessToken);
            
            if (response.refreshToken) {
              localStorage.setItem('refresh_token', response.refreshToken);
            }
          }
        })
      );
  }

  // Logout avec suppression des tokens
logout(): void {
    // Appel au backend
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        this.clearLocalStorage();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Même en cas d'erreur, on nettoie côté frontend
        this.clearLocalStorage();
        this.router.navigate(['/login']);
      }
    });
  }
   private clearLocalStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    // Ajoutez ici tous les autres éléments à supprimer
  }
  // Check if user is authenticated  
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null;
  }
 
  getUserInfo(): User | null {
    const token = this.getToken();
    if (!token) return null;

    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;

    try {
      const user: User = JSON.parse(userData);
      console.log('Utilisateur récupéré du localStorage :', user); // 🔍 Debug
      return user;
    } catch (error) {
      console.error('Erreur lors du parsing des données de l’utilisateur', error);
      return null;
    }
  }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }
    hasPermission(permissionKey: string): boolean {
    if (!this.currentUser || !this.currentUser.permissions) return false;
    return this.currentUser.permissions.some((p: any) => p.name === permissionKey);
  }
}