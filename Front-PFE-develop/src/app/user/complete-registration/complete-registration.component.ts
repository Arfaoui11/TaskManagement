import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complete-registration',
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.css']
})
export class CompleteRegistrationComponent {
  registrationForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.registrationForm = this.fb.group({
      username: [''],
      email: [''],
      password: [''],
      confirmPassword: [''],
      firstName: [''],
      lastName: [''],
      phoneNumber: [''],
      dateOfBirth: [''],
      gender: [''],
      position: [''],
      address: ['']
    });
  }

  onCompleteRegistration() {
    console.log("Bouton cliqué, tentative d'inscription...");

    if (this.registrationForm.valid) {
      const userDetails = this.registrationForm.value;
      console.log("Données envoyées :", userDetails);

      this.userService.completeRegistration(userDetails).subscribe({
        next: (response) => {
          console.log('Réponse du serveur :', response);
          this.successMessage = 'Inscription complétée avec succès!';
          this.errorMessage = '';
          this.router.navigate(['/login']);  
        },
        error: (err) => {
          console.error('Erreur d\'inscription', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la complétion de l\'inscription';
          this.successMessage = '';
        }
      });
    } else {
      console.log("Formulaire invalide:", this.registrationForm.errors);
    }
  }
}
