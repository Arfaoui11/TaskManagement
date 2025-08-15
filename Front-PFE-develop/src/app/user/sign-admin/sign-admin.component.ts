import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Role } from '../../models/role.model';
import { of, map, catchError } from 'rxjs';

@Component({
  selector: 'app-sign-admin',
  templateUrl: './sign-admin.component.html',
  styleUrls: ['./sign-admin.component.css']
})
export class SignAdminComponent implements OnInit {
  inviteForm!: FormGroup;
  roles: Role[] = [];
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.inviteForm = this.fb.group({
 email: ['', 
        [Validators.required, Validators.email], 
        [this.emailExistsValidator()]  // validateur async ici
      ],      username: ['', [Validators.required, Validators.minLength(3)]],
      roleId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getRoles();
  }

  getRoles() {
    this.userService.getRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: (err) => console.error('Erreur de chargement des rôles', err)
    });
  }
emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }
      return this.userService.checkEmailExists(control.value).pipe(
        map(isTaken => (isTaken ? { emailExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  onInviteUser() {
    if (this.inviteForm.valid) {
      this.userService.inviteUser(this.inviteForm.value).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur invité avec succès';
          this.inviteForm.reset();
          
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de l\'invitation';
        }
      });
    }
  }
}
