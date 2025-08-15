import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  message: string = '';
  isSubmitted: boolean = false;
  isError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Récupérer le token depuis l'URL
    this.token = this.route.snapshot.params['token'];
    console.log("Token récupéré:", this.token);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      return null;
    }
    
    return { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.isSubmitted = true;
      const newPassword = this.resetForm.get('password')?.value;
      
      this.authService.resetPassword(this.token, newPassword).subscribe(
        response => {
          this.message = "Mot de passe réinitialisé avec succès";
          this.isError = false;
        },
        error => {
          this.message = "Erreur lors de la réinitialisation du mot de passe";
          this.isError = true;
          this.isSubmitted = false;
        }
      );
    }
  }
}