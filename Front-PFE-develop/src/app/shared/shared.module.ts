import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { CardComponent } from './components/card/card.component';
import { AppRoutingModule } from '../app-routing.module';
import { NotificationComponent } from './components/notification/notification.component'; // adapte ce chemin à ta structure de dossier

@NgModule({
  declarations: [
    TopbarComponent,
    SidebarComponent,
    DashboardComponent,
    CardComponent,NotificationComponent
  ],
  imports: [
    CommonModule,AppRoutingModule,RouterModule
  ],
  exports: [
    TopbarComponent,
    SidebarComponent,
    DashboardComponent,
    CardComponent,NotificationComponent
  
  ]
})
export class SharedModule {}