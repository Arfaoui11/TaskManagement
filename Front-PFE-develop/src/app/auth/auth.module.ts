import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importez les deux modules
import { PasswordEmailComponent } from './password-email/password-email.component';
import { RouterModule } from '@angular/router';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthInterceptor } from './Auth.Interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [LoginComponent, PasswordEmailComponent, ResetPasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Ajoutez ReactiveFormsModule ici
    RouterModule
  ],
  providers: [
    // Configuration de l'intercepteur
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
    // ... autres services
  ],

})
export class AuthModule { }