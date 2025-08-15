import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ProjetModule } from "../../../projet/projet.module";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent  {
  isCollapsed = false;
  currentUserPermissions: string[] = []; // Toujours initialiser

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserPermissions();
  }

  private loadUserPermissions(): void {
    try {
      const currentUser = this.authService.getUserInfo();
      
      if (!currentUser?.role?.permissions) {
        console.warn('Aucune permission trouvée pour l\'utilisateur');
        return;
      }

      this.currentUserPermissions = currentUser.role.permissions
        .map((p: { name: string }) => p.name)
        .filter((name: string | undefined): name is string => !!name);
      
    } catch (error) {
      console.error('Erreur lors du chargement des permissions', error);
      this.currentUserPermissions = [];
    }
  }

  hasPermission(permissionKey: string): boolean {
    if (!permissionKey) return false;
    return this.currentUserPermissions.includes(permissionKey);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
