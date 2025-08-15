import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Role } from '../../models/role.model';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  user!: User;
  roles: Role[] = [];
  showUpdateModal = false;
  updateUserForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.updateUserForm = this.fb.group({
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
      address: [''],
      role: [''],
      activated: [false]
    });
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userService.getUserById(+userId).subscribe((data) => {
        this.user = data;
      });
    }

    this.roleService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });
  }

  openModal() {
    this.updateUserForm.patchValue({
      ...this.user,
      role: this.user.role?.id || '',
      team: this.user.teams || ''
    });
    this.showUpdateModal = true;
  }

  closeModal() {
    this.showUpdateModal = false;
  }

  onSubmit() {
    if (this.updateUserForm.valid) {
      const updatedData = { ...this.updateUserForm.value };
      delete updatedData.confirmPassword;

      this.userService.updateUser(this.user.id, updatedData).subscribe(() => {
        this.user = { ...this.user, ...updatedData };
        this.closeModal();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  goToUpdateUser(): void {
    this.router.navigate(['update-user', this.user.id]);
  }
}
