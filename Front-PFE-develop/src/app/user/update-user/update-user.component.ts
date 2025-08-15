import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service'; 
import { RoleService } from '../../services/role.service'; 
import { User } from '../../models/user.model'; 
import { Role } from '../../models/role.model'; 

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  updateUserForm!: FormGroup;
  user!: User;
  roles: Role[] = [];
  userId!: number;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    // Initialisation du formulaire
    this.updateUserForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      dateOfBirth: [''],
      gender: ['', Validators.required],
      position: [''],
      address: [''],
      role: ['', Validators.required], // Role stocke l'ID
      team: [''],
      activated: [false]
    });

    // 🔹 Récupérer l'utilisateur
    this.userService.getUserById(this.userId).subscribe(user => {
      this.user = user;
      const formattedDateOfBirth = user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '';

      this.updateUserForm.patchValue({
        ...user,
        dateOfBirth: formattedDateOfBirth,
        role: user.role?.id || ''  // ✅ Stocke l'ID du rôle
      });
    });

    // 🔹 Récupérer les rôles disponibles
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles;
    });
  }

  // 🔹 Soumission du formulaire
  onSubmit(): void {
    if (this.updateUserForm.invalid) return;

    const updatedUser: Partial<User> = {
      ...this.updateUserForm.value,
      role: { id: this.updateUserForm.value.role } // ✅ Stocke bien l'ID du rôle
    };

    this.userService.updateUser(this.userId, updatedUser).subscribe(() => {
      this.successMessage = 'Utilisateur mis à jour avec succès !';
      setTimeout(() => this.router.navigate(['/users']), 2000);
    });
  }
  
}
