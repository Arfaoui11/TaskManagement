import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserModule } from './user/user.module';  // Vérifiez le chemin
import { CommonModule } from '@angular/common';
import { RoleService } from './services/role.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from './services/permissions.service';
import { ProjetService } from './services/projet.service';
import { ProjetModule } from './projet/projet.module';
import { DossierService } from './services/dossier.service';
import { DocumentService } from './services/document.service';
import { TacheService } from './services/tache.service';
import { WebSocketService } from './services/WebSocketService';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,CommonModule,
    AppRoutingModule,
    AuthModule,RouterModule,
    UserModule,
    HttpClientModule,ReactiveFormsModule,ProjetModule
  ],
  providers: [
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    ProjetService,DossierService,DocumentService,TacheService,WebSocketService
  ],
  bootstrap: [AppComponent],
  exports: [] // Exportez les composants ici

})
export class AppModule { }
