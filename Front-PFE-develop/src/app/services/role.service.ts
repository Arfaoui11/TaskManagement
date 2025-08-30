import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Role } from '../models/role.model';
import { environment } from '../../environments/environment';
import { Permission } from '../models/permission.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`; // Your backend API URL

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

 // RoleService
 updateRole(id: number, role: Role): Observable<Role> {
  return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
}


deleteRole(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);

}

  getPermissions(): Observable<Permissions[]> {
    return this.http.get<Permissions[]>(`http://localhost:8000/api2/permissions`);
  }
 getPermissionById(id: number): Observable<Permission> {
     return this.http.get<Permission>(`http://localhost:8000/api2/permissions/${id}`);
   }
   updatePermissions(roleId: string, permissions: any[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${roleId}/permissions`, { permissions });
  }
  getPermissionsByRole(roleId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roleId}/permissions`);
  }
  // Dans le service role.service.ts
deletePermissionFromRole(roleId: number, permissionId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${roleId}/permissions/${permissionId}`);
}
addPermissionToRole(roleId: number, permissionId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/${roleId}/permissions/${permissionId}`, {});
}
filterRoles(searchTerm: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/filter?q=${searchTerm}`);
  }
  }
