import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Permission } from '../../models/permission.models';
import { PermissionService } from '../../services/permissions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnInit {
  
  newRoleName: string = '';
  availablePermissions: Permission[] = []; // Liste des permissions récupérées depuis le backend
  selectedPermissions: number[] = []; // Liste des permissions sélectionnées par l'utilisateur (en utilisant les IDs)
  newPermission: string = ''; // Nouvelle permission que l'utilisateur peut créer

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;

  constructor(private roleService: RoleService, private permissionsService: PermissionService,    private router: Router  // Injection du service Router
  ) {}

  ngOnInit(): void {
    this.getPermissions();
  }

  // Méthode pour récupérer les permissions
  getPermissions() {
    this.permissionsService.getPermissions().subscribe(
      (permissions: Permission[]) => {
        this.availablePermissions = permissions;
      },
      (error) => {
        console.error('Erreur lors de la récupération des permissions', error);
      }
    );
  }

  // Récupérer les permissions paginées
  get paginatedPermissions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    return this.availablePermissions.slice(startIndex, endIndex);
  }

  // Calculer le nombre total de pages
  getTotalPages(): number {
    const totalPermissions = this.availablePermissions.length;
    return Math.ceil(totalPermissions / this.itemsPerPage);
  }

  // Sauvegarder le nouveau rôle
  saveNewRole() {
    if (this.newRoleName && this.selectedPermissions.length > 0) {
      const role = {
        name: this.newRoleName,
        permissions: this.selectedPermissions
          .map(permissionId => {
            return this.availablePermissions.find(permission => permission.id === permissionId);
          })
          .filter(permission => permission !== undefined) as Permission[], // Force the type to `Permission[]` after filtering out `undefined`
      };

      this.roleService.createRole(role).subscribe(
        (role) => {
          console.log('New role created:', role);
          // Reset fields after role creation
          this.newRoleName = '';
          this.selectedPermissions = [];
          this.router.navigate(['/roles']);

        },
        (error) => {
          console.error('Error creating role', error);
        }
      );
    }
  }

  // Changer de page
  changePage(page: number) {
    this.currentPage = page;
  }

  // Toggle de permission sélectionnée
  togglePermission(permissionId: number) {
    if (this.selectedPermissions.includes(permissionId)) {
      this.selectedPermissions = this.selectedPermissions.filter(id => id !== permissionId);
    } else {
      this.selectedPermissions.push(permissionId);
    }
  }

  // Ajouter une nouvelle permission
  addNewPermission() {
    if (this.newPermission) {
      const newPermission: Permission = {
        name: this.newPermission,
        id: 0,
      };

      // Call the service to create a new permission in the backend
      this.permissionsService.createPermission(newPermission).subscribe(
        (permission: Permission) => {
          console.log('New permission created:', permission);

          // Add the new permission to the available permissions list
          this.availablePermissions.push(permission);

          // Reset the input field for new permission
          this.newPermission = '';

          // Optionally refresh the available permissions (by re-fetching from the backend)
          this.getPermissions();
        },
        (error) => {
          console.error('Error creating permission', error);
        }
      );
    }
  }
}
