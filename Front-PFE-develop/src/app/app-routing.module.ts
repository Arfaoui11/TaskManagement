import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { PasswordEmailComponent } from './auth/password-email/password-email.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignAdminComponent } from './user/sign-admin/sign-admin.component';
import { ConfirmIdentityComponent } from './user/confirm-identity/confirm-identity.component';
import { CompleteRegistrationComponent } from './user/complete-registration/complete-registration.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserDetailsComponent } from './user/user-details/user-details.component';
import { RoleListComponent } from './user/role-list/role-list.component';
import { RoleFormComponent } from './user/role-form/role-form.component';
import { UpdateUserComponent } from './user/update-user/update-user.component';
import { RoleUpdateComponent } from './user/role-update/role-update.component';
import { ProjetListComponent } from './projet/projet-list/projet-list.component';
import { DossierListComponent } from './projet/dossier-list/dossier-list.component';
import { DocumentListComponent } from './projet/document-list/document-list.component';
import { CreateProjetComponent } from './projet/create-projet/create-projet.component';
import { CreateDossierComponent } from './projet/create-dossier/create-dossier.component';
import { CreateDocumentComponent } from './projet/create-document/create-document.component';
import { DetailDocumentComponent } from './projet/detail-document/detail-document.component';
import { TeamListComponent } from './user/team-list/team-list.component';
import { CreateTeamComponent } from './user/create-team/create-team.component';
import { UpdateTeamComponent } from './user/update-team/update-team.component';
import { ManageMembersComponent } from './user/manage-members/manage-members.component';
import { UpdateProjetComponent } from './projet/update-projet/update-projet.component';
import { UpdateDossierComponent } from './projet/update-dossier/update-dossier.component';
import { UpdateDocumentComponent } from './projet/update-document/update-document.component';
import { ArchieveComponent } from './projet/archieve/archieve.component';
import { ListTaskComponent } from './projet/list-task/list-task.component';
import { UpdateTaskComponent } from './projet/update-task/update-task.component';
import { CalendarTachesComponent } from './projet/calendar-taches/calendar-taches.component';
import { DossiersDocumentsComponent } from './projet/dossiers-documents/dossiers-documents.component';
import { UserAvailabilityComponent } from './projet/user-availability/user-availability.component';
import { StatComponent } from './projet/stat/stat.component';
import { PermissionsListComponent } from './user/permissions-list/permissions-list.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  { path: 'forgot-password', component: PasswordEmailComponent },
  { path: 'users/confirm-identity/:token', component: ConfirmIdentityComponent },
{ path: 'complete-registration/:token', component: CompleteRegistrationComponent },
    { path: 'user-availability', component: UserAvailabilityComponent },
    { path: 'notifications', component: NotificationComponent },

  { path: 'dashboard/sidebar', component: SidebarComponent },
  { path: 'dashboard/topbar', component: TopbarComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'auth/reset-password/:token', component: ResetPasswordComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/:id', component: UserDetailsComponent }, // Route dynamique
  { path: 'roles', component: RoleListComponent },
  { path: 'role-form', component: RoleFormComponent },
  { path: 'update-user/:id', component: UpdateUserComponent },
  { path: 'role-update/:id', component: RoleUpdateComponent },
  { path: 'projets', component: ProjetListComponent },
  { path: 'dossiers/projets/:projetId', component: DossierListComponent }, // Route pour la liste des dossiers
  { path: 'dossiers/projets/:projetId/dossiers/:dossierId/documents', component: DocumentListComponent },
  { path: 'create-projet', component: CreateProjetComponent }, // Route pour la liste des dossiers
  { path: 'teams', component: TeamListComponent },

  { path: 'update-team/:id', component: UpdateTeamComponent },
  { path: 'update-projet/:projetId', component: UpdateProjetComponent },
  {
    path: 'dossiers/projets/:projetId/dossiers/:dossierId/edit',
    component: UpdateDossierComponent
  },
  { path: 'dossiers-documents/projets/:projetId', component: DossiersDocumentsComponent }, // Page pour afficher les dossiers d'un projet
  { path: 'dashboard/stat', component: StatComponent },

  { path: 'dossiers/projets/:projetId/dossiers/:dossierId/documents/:documentId/update', component: UpdateDocumentComponent },

  { path: 'teams/:id/manage-members', component: ManageMembersComponent },
  { path: 'calendar', component: CalendarTachesComponent },
  { path: 'permissions', component: PermissionsListComponent },

  {
    path: 'dossiers/projets/:projetId/dossiers/:dossierId/documents/create-document',
    component: CreateDocumentComponent,
  },
  
  {
    path: 'dossiers/projets/:projetId/documents/create-document',
    component: CreateDocumentComponent,
  },

  { path: 'dossiers/:dossierId/documents/:documentId', component: DetailDocumentComponent },
  { 
    path: 'dossiers-documents/projets/:projetId/create-dossier/parent/:parentId', 
    component: CreateDossierComponent 
  },
  { 
    path: 'dossiers-documents/projets/:projetId/create-dossier', 
    component: CreateDossierComponent 
  },

  { path: 'create-team', component: CreateTeamComponent },
  { path: 'projets/:projetId/archieve', component: ArchieveComponent },
  { path: 'list-task/:projetId', component: ListTaskComponent },


{ path: 'sign-admin', component: SignAdminComponent },
{ path: 'list-task', component: ListTaskComponent },
{ path: 'update-task/:id', component:UpdateTaskComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },  // Page 404 redirigée vers login*/

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
