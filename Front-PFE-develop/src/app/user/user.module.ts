import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importez les deux modules
import { SignAdminComponent } from './sign-admin/sign-admin.component';
import { ConfirmIdentityComponent } from './confirm-identity/confirm-identity.component';
import { CompleteRegistrationComponent } from './complete-registration/complete-registration.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { RoleUpdateComponent } from './role-update/role-update.component';
import { TeamListComponent } from './team-list/team-list.component';
import { CreateTeamComponent } from './create-team/create-team.component';
import { UpdateTeamComponent } from './update-team/update-team.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';
import { PermissionsListComponent } from './permissions-list/permissions-list.component';


@NgModule({
  declarations: [SignAdminComponent,ConfirmIdentityComponent,CompleteRegistrationComponent ,SignAdminComponent,UserListComponent,UserDetailsComponent,RoleListComponent,RoleFormComponent,UpdateUserComponent,RoleUpdateComponent,TeamListComponent,CreateTeamComponent,UpdateTeamComponent,ManageMembersComponent,PermissionsListComponent
      ], // Declare TopbarComponent],
  imports: [
    CommonModule,
        FormsModule,
        ReactiveFormsModule, // Ajoutez ReactiveFormsModule ici
        RouterModule,HttpClientModule,
        SharedModule,
  ]
})
export class UserModule { }
