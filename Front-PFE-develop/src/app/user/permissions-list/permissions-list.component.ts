import { Component, OnInit } from '@angular/core';
import { Permission } from '../../models/permission.models';
import { PermissionService } from '../../services/permissions.service';

@Component({
  selector: 'app-permissions-list',
  templateUrl: './permissions-list.component.html',
  styleUrl: './permissions-list.component.css'
})
export class PermissionsListComponent implements OnInit {
permissions: Permission[] = [];
  newPermission: Permission = { id: 0, name: ''};
  editMode = false;
  currentPermissionId: number | null = null;
// Pagination
currentPage: number = 1;
itemsPerPage: number = 8;
paginatedPermissions: Permission[] = [];

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }
loadPermissions(): void {
  this.permissionService.getPermissions().subscribe(data => {
    this.permissions = data;
    this.updatePaginatedPermissions();
  });
}
updatePaginatedPermissions(): void {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedPermissions = this.permissions.slice(startIndex, endIndex);
}
  savePermission(): void {
    if (this.editMode && this.currentPermissionId !== null) {
      this.permissionService.updatePermission(this.currentPermissionId, this.newPermission).subscribe(() => {
        this.loadPermissions();
        this.resetForm();
      });
    } else {
      this.permissionService.createPermission(this.newPermission).subscribe(() => {
        this.loadPermissions();
        this.resetForm();
      });
    }
  }

  editPermission(permission: Permission): void {
    this.editMode = true;
    this.currentPermissionId = permission.id;
    this.newPermission = { ...permission };
  }

  deletePermission(id: number): void {
    this.permissionService.deletePermission(id).subscribe(() => this.loadPermissions());
  }


  resetForm(): void {
    this.newPermission = { id: 0, name: '' };
    this.editMode = false;
    this.currentPermissionId = null;
  }
  changePage(page: number): void {
  this.currentPage = page;
  this.updatePaginatedPermissions();
}

get totalPages(): number[] {
  const pagesCount = Math.ceil(this.permissions.length / this.itemsPerPage);
  return Array.from({ length: pagesCount }, (_, i) => i + 1);
}
}
