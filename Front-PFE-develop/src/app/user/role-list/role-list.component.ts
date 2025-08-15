import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { Router } from '@angular/router';
import { PermissionService } from '../../services/permissions.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css'],
})
export class RoleListComponent implements OnInit {
 roles: Role[] = [];
  isLoading: boolean = false;  // Pour gérer l'état de chargement
showModal = false;
selectedRole: any = null;
paginatedRoles: Role[] = [];
  itemsPerPage = 1; // Augmenté pour une meilleure UX
currentPage = 1;
totalPages: number[] = [];
showPermissionPopup: boolean = false;
roleForPermission: Role | null = null;
selectedPermissions: number[] = [];
allPermissions: any;
filteredRoles: Role[] = [];
  searchTerm: string = '';

  constructor(
    private roleService: RoleService, 
    private router: Router,
    private permissionService: PermissionService,
      private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  // Charger tous les rôles avec leurs permissions
 loadRoles() {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.filteredRoles = [...roles];
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.isLoading = false;
      }
    });
  }
openPermissionPopup(role: Role) {
  this.permissionService.getPermissions().subscribe({
    next: (permissions) => {
      this.allPermissions = permissions;
      this.roleForPermission = role;
      this.selectedPermissions = role.permissions?.map(p => p.id) || [];
      this.showPermissionPopup = true;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des permissions', err);
    }
  });
}
savePermissionsForRole() {
  if (!this.roleForPermission || !this.selectedPermissions.length) return;

  this.isLoading = true; // Activer l'indicateur de chargement

  // Ajouter permissions une par une
  const observables = this.selectedPermissions.map(permissionId => 
    this.roleService.addPermissionToRole(this.roleForPermission!.id!, permissionId)
  );

  // Exécuter tous les appels API en parallèle
  forkJoin(observables).subscribe({
    next: () => {
      this.showPermissionPopup = false;
      this.roleForPermission = null;
      this.selectedPermissions = [];
      this.isLoading = false;
      
      // Rafraîchir la page entière
      window.location.reload();
    },
    error: (err) => {
      console.error('Erreur lors de lenregistrement des permissions', err);
      this.isLoading = false;
    }
  });
}

filterRoles(): void {
  if (!this.searchTerm) {
    this.filteredRoles = [...this.roles];
    console.log('Affichage de tous les rôles', this.filteredRoles);
  } else {
    const term = this.searchTerm.toLowerCase();
    this.filteredRoles = this.roles.filter(role => {
      const match = role.name.toLowerCase().includes(term);
      console.log(`Vérification: ${role.name} contient ${term}? ${match}`);
      return match;
    });
    console.log('Rôles filtrés:', this.filteredRoles);
  }
  
  this.currentPage = 1;
  this.calculatePagination();
  
  // Force la détection des changements si nécessaire
  this.cdr.detectChanges();
}
  clearSearch(): void {
    this.searchTerm = '';
    this.filterRoles();
  }

 
openModal(role: any) {
  this.selectedRole = JSON.parse(JSON.stringify(role)); // clone pour éviter les modifications directes
  this.showModal = true;
}
calculatePagination(): void {
  // Utilisez filteredRoles au lieu de roles
  const totalPagesCount = Math.ceil(this.filteredRoles.length / this.itemsPerPage);
  this.totalPages = Array.from({ length: totalPagesCount }, (_, i) => i + 1);
  this.paginateRoles();
}
paginateRoles(): void {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  // Utilisez filteredRoles ici aussi
  this.paginatedRoles = this.filteredRoles.slice(start, end);
}

changePage(page: number): void {
  this.currentPage = page;
  this.paginateRoles();
}
closeModal() {
  this.showModal = false;
  this.selectedRole = null;
}
  // Rediriger vers la page d'édition du rôle
  // Rediriger vers la page d'édition du rôle

onSubmit() {
  // Appel API ou logique de mise à jour ici
  this.roleService.updateRole(this.selectedRole.id, this.selectedRole).subscribe(() => {
    this.closeModal();
    this.fetchRoles(); // Recharger les rôles
  });
}
fetchRoles() {
  this.roleService.getRoles().subscribe({
    next: (roles) => {
      this.roles = roles;
      this.calculatePagination();
    },
    error: (err) => {
      console.error('Erreur lors du chargement des rôles', err);
    }
  });
}


  // Supprimer un rôle
 // Supprimer un rôle
 onDeleteRole(roleId: number) {
  this.roleService.deleteRole(roleId).subscribe(
    (response) => {
      console.log('Role deleted successfully', response);
      this.loadRoles();  // Recharge la liste des rôles après la suppression
    },
    (error) => {
      console.error('Error deleting role', error);
      alert('An error occurred while deleting the role');
    }
  );
}


onCreateRole(): void {
  this.router.navigate(['/role-form']);
}
onUpdateRole(roleId: number): void {
  // Vérifiez ici que roleId est bien défini
  console.log('Role ID to update:', roleId);

  // Rediriger vers la page de mise à jour du rôle
  this.router.navigate(['/role-update', roleId]);
}

  // Supprimer une permission d'un rôle spécifique
  onDeletePermissionFromRole(roleId: number | undefined, permissionId: number): void {
    if (roleId === undefined) {
      console.error("Role ID est manquant");
      return;
    }
  
    // Appeler le service pour supprimer la permission du rôle
    this.roleService.deletePermissionFromRole(roleId, permissionId).subscribe(
      () => {
        console.log('Permission supprimée du rôle');
        this.loadRoles(); // Recharger la liste des rôles après suppression
      },
      (error) => {
        console.error('Erreur lors de la suppression de la permission', error);
      }
    );
  }
  togglePermission(permissionId: number, event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked;
  
  if (isChecked) {
    // Add permission if checked
    if (!this.selectedPermissions.includes(permissionId)) {
      this.selectedPermissions.push(permissionId);
    }
  } else {
    // Remove permission if unchecked
    this.selectedPermissions = this.selectedPermissions.filter(id => id !== permissionId);
  }
}
}
