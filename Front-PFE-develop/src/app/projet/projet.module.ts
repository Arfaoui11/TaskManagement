import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { CardComponent } from '../shared/components/card/card.component';
import { SharedModule } from '../shared/shared.module';
import { DossierListComponent } from './dossier-list/dossier-list.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { CreateProjetComponent } from './create-projet/create-projet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateDossierComponent } from './create-dossier/create-dossier.component';
import { CreateDocumentComponent } from './create-document/create-document.component';
import { DetailDocumentComponent } from './detail-document/detail-document.component';
import { UpdateProjetComponent } from './update-projet/update-projet.component';
import { UpdateDossierComponent } from './update-dossier/update-dossier.component';
import { UpdateDocumentComponent } from './update-document/update-document.component';
import { ArchieveComponent } from './archieve/archieve.component';
import { ListTaskComponent } from './list-task/list-task.component';
import { UpdateTaskComponent } from './update-task/update-task.component';
import { CalendarTachesComponent } from './calendar-taches/calendar-taches.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DossiersDocumentsComponent } from './dossiers-documents/dossiers-documents.component';
import { UserAvailabilityComponent } from './user-availability/user-availability.component';
import { StatComponent } from './stat/stat.component';
import { NgChartsModule } from 'ng2-charts';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentModalComponent } from './document-modal/document-modal.component'; // adapte le chemin
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    ProjetListComponent,
    DossierListComponent,
    DocumentListComponent,
    CreateProjetComponent,
    CreateDossierComponent,
    CreateDocumentComponent,
    DetailDocumentComponent,
    UpdateProjetComponent,
    UpdateDossierComponent,
    UpdateDocumentComponent,ArchieveComponent,ListTaskComponent,UpdateTaskComponent,CalendarTachesComponent,DossiersDocumentsComponent,UserAvailabilityComponent,StatComponent,DocumentModalComponent


  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    RouterModule,
    SharedModule,
    FormsModule,     
    ReactiveFormsModule,
    HttpClientModule,FullCalendarModule,NgChartsModule,BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule, MatCardModule,
    MatProgressSpinnerModule,MatTabsModule


  ],
  exports: [
    ProjetListComponent
  ]
})
export class ProjetModule { }