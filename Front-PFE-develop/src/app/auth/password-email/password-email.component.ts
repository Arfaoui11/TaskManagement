import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-password-email',
  templateUrl: './password-email.component.html',
  styleUrl: './password-email.component.css'
})
export class PasswordEmailComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private passwordEmailService: AuthService) {}

  onSubmit() {
    if (this.email) {
      this.passwordEmailService.forgotPassword(this.email).subscribe(
        (response) => {
          this.message = response.message;
          this.error = '';
        },
        (err) => {
          this.error = err.error.message || 'Une erreur est survenue.';
          this.message = '';
        }
      );
    }
  }
}