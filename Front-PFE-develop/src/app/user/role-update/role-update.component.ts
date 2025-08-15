import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../services/permissions.service';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.models';

@Component({
  selector: 'app-role-update',
  templateUrl: './role-update.component.html',
  styleUrls: ['./role-update.component.css'],
})
export class RoleUpdateComponent implements OnInit {
  role: Role = { id: undefined, name: '', permissions: [] }; // Assurez-vous que `id` est inclus
  permissions: PermissionWithSelected[] = [];
  isLoading: boolean = true;

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérification du paramètre 'id' dans l'URL
    const roleId = this.route.snapshot.paramMap.get('id');
    console.log('Role ID from URL:', roleId);

    if (roleId) {
      this.loadRole(parseInt(roleId));
      this.loadPermissions();
    } else {
      console.error('Role ID is missing from the route');
      this.router.navigate(['/roles']);
    }
  }

  loadRole(roleId: number): void {
    console.log('Loading role with ID:', roleId);
    this.roleService.getRoleById(roleId).subscribe(
      (role) => {
        console.log('Role loaded:', role);
        this.role = role;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading role', error);
        this.isLoading = false;
      }
    );
  }

  loadPermissions(): void {
    console.log('Loading permissions...');
    this.permissionService.getPermissions().subscribe(
      (permissions) => {
        console.log('Permissions loaded:', permissions);
        // Map the permissions to include the 'selected' property
        this.permissions = permissions.map((permission) => ({
          ...permission,
          selected: this.role.permissions.some(
            (rolePermission) => rolePermission.id === permission.id
          ),
        }));
      },
      (error) => {
        console.error('Error loading permissions', error);
      }
    );
  }

  onSubmit(): void {
    console.log('Permissions before update:', this.permissions); // Vérifiez les permissions avant la mise à jour

    const updatedPermissions = this.permissions
      .filter((permission) => permission.selected)
      .map((permission) => ({
        id: permission.id,
        name: permission.name, // Utiliser le nom mis à jour
        isGranted: permission.selected, // Utiliser l'état isGranted mis à jour
      }));

    console.log('Updated Permissions:', updatedPermissions); // Vérifiez les permissions mises à jour

    // Vérifiez que role.id est défini avant de procéder à la mise à jour
    if (this.role.id !== undefined) {
      const updatedRole: Role = {
        ...this.role,
        permissions: updatedPermissions, // Inclure les permissions mises à jour
      };

      console.log('Updating role:', updatedRole); // Vérifiez l'objet role mis à jour

      this.roleService.updateRole(this.role.id, updatedRole).subscribe(
        (response) => {
          console.log('Role updated successfully', response);
          this.router.navigate(['/roles']);
        },
        (error) => {
          console.error('Error updating role', error);
          alert('Failed to update role');
        }
      );
    } else {
      console.error('Role ID is undefined');
      alert('Role ID is missing');
    }
  }

  onCancel(): void {
    this.router.navigate(['/roles']);
  }
}

// Interface pour ajouter 'selected' temporairement
interface PermissionWithSelected extends Permission {
  selected: boolean;
}