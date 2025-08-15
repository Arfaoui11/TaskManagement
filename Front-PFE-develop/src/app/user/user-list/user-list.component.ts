import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  isCreateUserPopupVisible: boolean = false; // <--- À ajouter

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(user => user.id !== id);
      });
    }
  }

  viewUserDetails(id: number): void {
    this.router.navigate(['/users', id]); 
  }

  openCreateUserPopup(): void {
    this.isCreateUserPopupVisible = true; // <--- Ouvre le popup
  }

  closeCreateUserPopup(): void {
    this.isCreateUserPopupVisible = false; // <--- Ferme le popup
  }
}
