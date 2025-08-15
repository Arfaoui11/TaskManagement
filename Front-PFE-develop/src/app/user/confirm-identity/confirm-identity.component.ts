import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirm-identity',
  templateUrl: './confirm-identity.component.html',
  styleUrls: ['./confirm-identity.component.css']
})
export class ConfirmIdentityComponent implements OnInit {
  confirmForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  token: string = '';  // Token récupéré depuis l'URL

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.confirmForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Récupérer le token depuis l'URL dynamique
    this.route.params.subscribe(params => {
      if (params['token']) {
        this.token = params['token']; // Récupérer le token de l'URL
        console.log('Token récupéré :', this.token);  // Vérifier que le token est bien récupéré
      } else {
        console.error('Token manquant dans l\'URL');
      }
    });
  }

  onConfirmIdentity() {
    if (this.confirmForm.valid) {
      const { otp } = this.confirmForm.value;

      // Vérifier que le token existe avant de faire l'appel
      if (!this.token) {
        this.errorMessage = 'Token introuvable.';
        return;
      }

      // Appeler le service pour activer l'utilisateur avec le token et l'OTP
      this.userService.activateUser(otp, this.token).subscribe({
        next: (response) => {
          this.successMessage = 'Votre identité a été confirmée et votre compte est activé!';
          this.errorMessage = '';
this.router.navigate(['/complete-registration', this.token]);
        },
        error: (err) => {
          console.error('Erreur d\'activation', err);
          this.errorMessage = err.error?.message || 'Erreur lors de l\'activation';
          this.successMessage = '';
        }
      });
    }
  }
}
