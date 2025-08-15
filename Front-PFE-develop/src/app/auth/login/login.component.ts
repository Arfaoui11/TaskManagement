import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Importer AuthService
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginRequest = {
    email: '',
    password: ''
  };
  loginMessage: string = '';
  loginErrorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('Données envoyées :', this.loginRequest); // Ajoutez ce log pour vérifier les données
    this.authService.login(this.loginRequest)
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.loginMessage = '✅ Authentication successful';
          this.loginErrorMessage = '';
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed', error); // Affichez l'erreur complète dans la console
          this.loginErrorMessage = '🔴 Erreur de connexion. Veuillez réessayer.';
          this.loginMessage = '';
        }
      });
  }
}
