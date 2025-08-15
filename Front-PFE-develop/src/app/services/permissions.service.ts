import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Permission } from '../models/permission.models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private apiUrl = `${environment.apiUrl}/permissions`; // Your backend API URL

  constructor(private http: HttpClient) { }

  // Récupérer toutes les permissions
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  // Récupérer une permission par son ID
  getPermissionById(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle permission
  createPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, permission);
  }

  // Mettre à jour une permission existante
  updatePermission(id: number, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, permission);
  }

  // Supprimer une permission
  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Supprimer une permission de tous les rôles
  deletePermissionFromRoles(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/role/${id}`);
  }
  setPermissionsForRole(roleId: number, permissionIds: number[]) {
  return this.http.put(`/api/roles/${roleId}/permissions`, { permissionIds });
}

}
