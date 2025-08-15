import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CalendarOptions, EventClickArg, EventDropArg, Calendar } from '@fullcalendar/core';
import { TacheService } from '../../services/tache.service';
import { ProjetService } from '../../services/projet.service';
import { Tache } from '../../models/tache.models';
import { Projet } from '../../models/projet.models';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-calendar-taches',
  templateUrl: './calendar-taches.component.html',
  styleUrls: ['./calendar-taches.component.css']
})
export class CalendarTachesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @Output() userAssigned = new EventEmitter<{userId: number, userName: string, task?: Tache}>();

  calendarApi: Calendar;
  selectedDate: Date | null = null;

  taches: Tache[] = [];
  projets: Projet[] = []; // Renommé pour suivre les conventions de nommage
  showPopup = false;
  selectedProjetId: number | null = null;
  currentUserId: number | null = null;
  selectedTache: Tache | null = null;
  tachesSansDate: Tache[] = [];
  showUserAvailability = false;
  
  private subscriptions: Subscription[] = []; // Pour gérer les souscriptions

  tache: Partial<Tache> = {
    titre: '',
    description: '',
    commentaires: '',
    dateDebut: undefined,
    dateFin: undefined,
    statut: 'EN_ATTENTE',
    priorite: 'NORMALE',
    tempsEstime: 0,
    tempsPasse: 0,
    categorie: '',
  };

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    eventResizableFromStart: true,
    eventStartEditable: true,
    eventDurationEditable: true,
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: frLocale,
    events: [],
    eventClick: (info) => this.handleEventClick(info),
    eventDrop: (info) => this.handleEventUpdate(info),
    eventResize: (info) => this.handleEventResize(info),
    dateClick: this.handleDateClick.bind(this),
    droppable: true,
    drop: (info) => this.handleDrop(info),
    customButtons: {
      userAvailabilityButton: {
        text: 'Disponibilité utilisateurs',
        click: () => this.toggleUserAvailability()
      }
    }
  };
  
  currentMonth: Date = new Date();
  weekdays: string[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  calendarDays: (Date | null)[] = []; // Corrigé pour accepter null
  showFullCalendar: boolean = true;

  constructor(
    private tacheService: TacheService,
    private projetService: ProjetService,
    private authService: AuthService,
    private router: Router,
  private route: ActivatedRoute // Ajoutez cette ligne

  ) {}

 ngOnInit(): void {
  console.log('🏁 Initialisation du composant');
  this.getCurrentUserId();
  this.generateCalendarDays();

  // Récupérer l'ID du projet depuis les queryParams
  this.route.queryParams.subscribe(params => {
    this.selectedProjetId = params['projetId'] ? +params['projetId'] : null;
    
    // Charger les projets en premier
    const projetsSub = this.projetService.getProjets().subscribe({
      next: (projets) => {
        console.log('📚 Projets chargés:', projets);
        this.projets = projets;
        
        // Charger les tâches après avoir obtenu les projets
        this.loadTaches();
      },
      error: (err) => {
        console.error('⛔ Erreur lors du chargement des projets:', err);
        alert('⚠️ Impossible de charger les projets. Veuillez rafraîchir la page.');
      }
    });
    
    this.subscriptions.push(projetsSub);
    this.setupDragAndDropListeners();
  });
}
allerVersStatistiques() {
    this.router.navigate(['/dashboard/stat']);
}
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.calendarComponent) {
        this.calendarApi = this.calendarComponent.getApi();
      }
    }, 200);
  }

  ngOnDestroy(): void {
    // Nettoyage des souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleUserAvailability() {
    this.showUserAvailability = !this.showUserAvailability;
    if (this.showUserAvailability) {
      // Si on active la vue, on définit la date sélectionnée à aujourd'hui
      this.selectedDate = new Date();
    } else {
      this.selectedDate = null;
    }
  }

  getCurrentUserId(): void {
    const user = this.authService.getUserInfo();
    if (user) {
      console.log('Utilisateur trouvé dans getCurrentUserId :', user);
      this.currentUserId = user.id;
    } else {
      console.error('Utilisateur non connecté ou session expirée.');
    }
  }
loadTaches() {
  let tacheObservable;

  if (this.selectedProjetId) {
    tacheObservable = this.tacheService.getTachesByProjetId(this.selectedProjetId);
  } else {
    tacheObservable = this.tacheService.getAll();
  }

  const tachesSub = tacheObservable.subscribe({
    next: (taches: Tache[]) => {
      // ✅ Corriger les dates si ce sont des tableaux
      taches.forEach(t => {
        if (Array.isArray(t.dateDebut)) {
          const [y, m, d, h, min] = t.dateDebut;
          t.dateDebut = new Date(y, m - 1, d, h || 0, min || 0);
        }
        if (Array.isArray(t.dateFin)) {
          const [y, m, d, h, min] = t.dateFin;
          t.dateFin = new Date(y, m - 1, d, h || 0, min || 0);
        }
      });

      this.taches = taches;
      const tachesAvecDate = taches.filter(t => t.dateDebut && t.dateFin);
      this.tachesSansDate = taches.filter(t => !t.dateDebut || !t.dateFin);

      // ✅ Assurez-vous que les dates sont valides ici
      this.calendarOptions.events = tachesAvecDate.map(t => ({
        id: t.id?.toString(),
        title: `${t.titre} (${t.statut})`,
        start: t.dateDebut,
        end: t.dateFin,
        backgroundColor: this.getBackgroundColorByStatus(t.statut),
        borderColor: this.getBorderColorByPriority(t.priorite),
        extendedProps: {
          description: t.description,
          priorite: t.priorite,
          statut: t.statut,
          responsable: t.responsable,
          tempsPasse: t.tempsPasse || 0
        }
      }));
    },
    error: (error) => {
      console.error('Erreur lors du chargement des tâches :', error);
    }
  });

  this.subscriptions.push(tachesSub);
}

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  private generateCalendarDays(): void {
    this.calendarDays = [];

    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // convert to Monday-started week

    // Add blank days before the first of the month
    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push(null); // Add null placeholders
    }

    // Add actual days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      this.calendarDays.push(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day));
    }
  }

  // Charge toutes les tâches et les sépare entre tâches avec dates et sans dates


  // Gère la dépose d'une tâche sans date sur le calendrier
  handleDrop(info: any) {
    const tacheId = info.draggedEl?.getAttribute('data-tache-id');
    if (!tacheId) return;
    
    const tache = this.tachesSansDate.find(t => t.id === parseInt(tacheId, 10));
    if (!tache) return;
    
    // Définir les nouvelles dates pour la tâche
    const droppedDate = info.date;
    const dateDebut = new Date(droppedDate);
    
    // Par défaut, on fixe une durée d'une heure
    const dateFin = new Date(droppedDate);
    dateFin.setHours(dateFin.getHours() + 1);
    
    // Préparer la tâche mise à jour
    const updatedTache: Tache = {
      ...tache,
      dateDebut,
      dateFin,
    };
    
    // Appeler l'API pour mettre à jour la tâche
    const updateSub = this.tacheService.update(tache.id!, updatedTache).subscribe({
      next: () => {
        alert('✅ Tâche planifiée avec succès.');
        this.loadTaches(); // Recharger toutes les tâches
      },
      error: (err) => {
        console.error('Erreur lors de la planification :', err);
        alert('❌ Échec de la planification de la tâche.');
      }
    });
    
    this.subscriptions.push(updateSub);
  }

  handleEventClick(arg: EventClickArg) {
    const event = arg.event;
    const tacheId = Number(event.id);
    const t = this.taches.find(x => x.id === tacheId) || null;
    if (!t) return;
    this.selectedTache = t;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedTache = null;
  }

  deleteTache(id: number) {
    const deleteSub = this.tacheService.delete(id).subscribe({
      next: () => {
        alert('🗑️ Tâche supprimée avec succès.');
        this.loadTaches();
        this.closePopup();
      },
      error: (err) => {
        console.error('Erreur de suppression :', err);
        alert('❌ Une erreur est survenue lors de la suppression.');
      }
    });
    
    this.subscriptions.push(deleteSub);
  }

  handleEventUpdate(info: EventDropArg) {
    const event = info.event;

    if (event.start && event.end) {
      const eventId = Number(event.id);
      if (isNaN(eventId)) {
        alert('❌ L\'ID de l\'événement est invalide.');
        info.revert();
        return;
      }

      // Trouver la tâche originale pour ne pas perdre les données
      const originalTache = this.taches.find(t => t.id === eventId);
      if (!originalTache) {
        alert('❌ Impossible de trouver la tâche.');
        info.revert();
        return;
      }

      const updatedTache: Tache = {
        ...originalTache,
        dateDebut: new Date(event.start),
        dateFin: new Date(event.end)
      };

      const updateSub = this.tacheService.update(eventId, updatedTache).subscribe({
        next: () => alert('📝 Tâche mise à jour avec succès.'),
        error: (err) => {
          console.error('Erreur mise à jour :', err);
          alert('❌ Échec de mise à jour');
          info.revert();
        }
      });
      
      this.subscriptions.push(updateSub);
    } else {
      alert('❌ Les dates sont invalides.');
      info.revert();
    }
  }

  // Crée un élément "dragable" pour une tâche sans date
  makeTaskDraggable(event: MouseEvent): void {
    const target = event.target as HTMLElement;
  
    if (target && target.parentElement) {
      new Draggable(target.parentElement, {
        itemSelector: '.tache-draggable',
        eventData: function(element) {
          return {
            title: element.querySelector('strong')?.textContent || '',
            id: element.getAttribute('data-tache-id')
          };
        }
      });
    }
  }

  // Supprime les dates d'une tâche (la déplace vers la liste des tâches sans date)
  removeTacheDates(tacheId: number) {
    const tache = this.taches.find(t => t.id === tacheId);
    if (tache) {
      const updatedTache: Tache = {
        ...tache,
        dateDebut: undefined,
        dateFin: undefined
      };
      
      const updateSub = this.tacheService.update(tacheId, updatedTache).subscribe({
        next: () => {
          alert('📝 Tâche déplanifiée avec succès.');
          this.loadTaches();
          this.closePopup();
        },
        error: (err) => {
          console.error('Erreur lors de la déplanification :', err);
          alert('❌ Échec de la déplanification.');
        }
      });
      
      this.subscriptions.push(updateSub);
    }
  }

  getValidStatut(title: string): "EN_ATTENTE" | "EN_COURS" | "TERMINEE" {
    if (title.includes("EN_COURS") || title.includes("En cours")) return "EN_COURS";
    if (title.includes("TERMINEE") || title.includes("Terminé")) return "TERMINEE";
    return "EN_ATTENTE";
  }

  onDateDebutChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.valueAsDate) {
      this.tache.dateDebut = input.valueAsDate;
    }
  }
  
  handleDateClick(arg: any) {
    const clickedDate: Date = arg.date;
    console.log('📅 Date cliquée:', clickedDate);

    // Initialiser une nouvelle tâche avec la date cliquée
    this.tache = {
      titre: '',
      description: '',
      commentaires: '',
      dateDebut: clickedDate,
      dateFin: new Date(clickedDate.getTime() + 60 * 60 * 1000), // +1h
      statut: 'EN_ATTENTE',
      priorite: 'NORMALE',
      tempsEstime: 0,
      tempsPasse: 0,
      categorie: '',
    };

    this.showPopup = true;
  }

  openPopup() {
    this.showPopup = true;
  }

  onDateFinChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.tache.dateFin = new Date(input.value);
    }
  }

  createTache() {
    console.log('🚀 Début création tâche');
    console.log('📋 État actuel des variables:');
    console.log('- this.selectedProjetId:', this.selectedProjetId);
    console.log('- this.tache:', this.tache);
    console.log('- this.projets:', this.projets);

    if (!this.selectedProjetId) {
      alert("⚠️ Veuillez sélectionner un projet.");
      return;
    }

    // Vérifier si le projet existe
const projet = this.projets.find(p => p.id == this.selectedProjetId);
    if (!projet) {
      alert("⚠️ Le projet sélectionné n'existe pas.");
      return;
    }

    // Création de la tâche à partir des données du formulaire
    const newTache: Tache = {
      id: 0,
      titre: this.tache.titre!,
      description: this.tache.description!,
      commentaires: this.tache.commentaires || '',
      dateDebut: this.tache.dateDebut!,
      dateFin: this.tache.dateFin!,
      statut: this.tache.statut!,
      priorite: this.tache.priorite!,
      tempsEstime: this.tache.tempsEstime || 0,
      tempsPasse: this.tache.tempsPasse || 0,
      categorie: this.tache.categorie || '',
      fullName: this.tache.fullName || '',
      projet: {
        id: this.selectedProjetId,
        title: '',
        description: '',
        createdAt: '',
        updatedAt: null,
        archived: false,
        userIds: [],
      },
    };

    const createSub = this.tacheService.create(newTache).subscribe({
      next: () => {
        alert('✅ Tâche créée avec succès.');
        this.showPopup = false;
        this.loadTaches(); // recharge les tâches pour mettre à jour le calendrier
        
        // Réinitialiser le formulaire
        this.tache = {
          titre: '',
          description: '',
          commentaires: '',
          dateDebut: undefined,
          dateFin: undefined,
          statut: 'EN_ATTENTE',
          priorite: 'NORMALE',
          tempsEstime: 0,
          tempsPasse: 0,
          categorie: '',
        };
      },
      error: (err) => {
        console.error('Erreur lors de la création de la tâche:', err);
        alert('❌ Échec de la création de la tâche.');
      }
    });
    
    this.subscriptions.push(createSub);
  }

  formatToDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Mois indexé à 0
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Crée une nouvelle tâche sans date
  createTacheSansDate() {
    if (!this.selectedProjetId) {
      alert("⚠️ Veuillez sélectionner un projet.");
      return;
    }

    const newTache: Tache = {
      id: 0,
      titre: this.tache.titre!,
      description: this.tache.description!,
      commentaires: this.tache.commentaires || '',
      // Pas de dates définies
      dateDebut: undefined,
      dateFin: undefined,
      projet: {
        id: this.selectedProjetId,
        title: '',
        description: '',
        createdAt: '',
        updatedAt: null,
        archived: false,
        userIds: [],
      },
      statut: this.tache.statut!,
      priorite: this.tache.priorite!,
      tempsEstime: this.tache.tempsEstime ?? 0,
      tempsPasse: this.tache.tempsPasse ?? 0,
      categorie: this.tache.categorie || '',
      fullName: ''
    };

    const createSub = this.tacheService.create(newTache).subscribe({
      next: () => {
        alert('✅ Tâche créée avec succès.');
        this.closePopup();
        this.loadTaches();
        
        // Réinitialiser le formulaire
        this.tache = {
          titre: '',
          description: '',
          commentaires: '',
          dateDebut: undefined,
          dateFin: undefined,
          statut: 'EN_ATTENTE',
          priorite: 'NORMALE',
          tempsEstime: 0,
          tempsPasse: 0,
          categorie: '',
        };
      },
      error: (err) => {
        console.error('Erreur lors de la création de la tâche:', err);
        alert('❌ Erreur lors de la création.');
      }
    });
    
    this.subscriptions.push(createSub);
  }

  handleEventResize(info: any): void {
    const event = info.event;
    const eventId = Number(event.id);
    
    if (isNaN(eventId)) {
      alert('❌ L\'ID de l\'événement est invalide.');
      info.revert();
      return;
    }
  
    // Trouver la tâche originale
    const originalTache = this.taches.find(t => t.id === eventId);
    if (!originalTache) {
      alert('❌ Impossible de trouver la tâche.');
      info.revert();
      return;
    }
  
    // Créer une copie de la tâche avec uniquement les dates mises à jour
    const updatedTache: Tache = {
      ...originalTache,
      dateDebut: new Date(event.start),
      dateFin: new Date(event.end)
    };
    
    // Log pour déboguer
    console.log('Tâche originale:', originalTache);
    console.log('Tâche mise à jour:', updatedTache);
  
    // Mettre à jour la tâche via l'API
    const updateSub = this.tacheService.update(eventId, updatedTache).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        alert('✅ Tâche mise à jour avec succès.');
        this.loadTaches(); // Recharger les tâches
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la tâche :', err);
        alert('❌ Échec de mise à jour');
        info.revert(); // Revenir à l'état précédent
      }
    });
    
    this.subscriptions.push(updateSub);
  }

  setupDragAndDropListeners(): void {
  console.log('Configuration des listeners de drag-and-drop');
  
  // Utilisez MutationObserver pour détecter les changements DOM
  const observer = new MutationObserver((mutations) => {
    this.attachDragDropListeners();
  });
  
  // Observer les changements dans le conteneur du calendrier
  const calendarContainer = document.querySelector('.fc-view-container');
  if (calendarContainer) {
    observer.observe(calendarContainer, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Faire une première tentative immédiate
  this.attachDragDropListeners();
}
attachDragDropListeners(): void {
  console.log('Attachement des écouteurs aux éléments du calendrier');
  
  // Sélectionner tous les éléments d'événement du calendrier
  const taskElements = document.querySelectorAll('.fc-event');
  console.log(`Nombre d'éléments trouvés: ${taskElements.length}`);
  
  taskElements.forEach(taskElement => {
    // Vérifier si les événements sont déjà attachés
    if (!(taskElement as any).__dragDropAttached) {
      console.log('Attacher les écouteurs à:', taskElement);
      
      taskElement.addEventListener('dragover', (event: Event) => {
        this.handleDragOver(event as DragEvent);
      });
      
      taskElement.addEventListener('dragleave', (event: Event) => {
        this.handleDragLeave(event as DragEvent);
      });
      
      taskElement.addEventListener('drop', (event: Event) => {
        this.handleTaskDrop(event as DragEvent);
      });
      
      // Marquer l'élément pour éviter d'attacher à nouveau les écouteurs
      (taskElement as any).__dragDropAttached = true;
      
      // Ajouter un attribut pour identifier l'élément comme zone de drop
      taskElement.setAttribute('data-task-id', taskElement.getAttribute('data-event') || '');
    }
  });
}

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.classList.add('dragover');
    }
    
    // Définir l'effet pour indiquer qu'une action de copie est possible
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  handleDragLeave(event: DragEvent): void {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.classList.remove('dragover');
    }
  }

  // Renommé pour éviter la confusion avec l'autre méthode handleDrop
  handleTaskDrop(event: DragEvent): void {
    event.preventDefault();
    
    // Récupérer l'élément cible et retirer la classe de surlignage
    const targetElement = event.currentTarget as HTMLElement;
    targetElement.classList.remove('dragover');
    
    // Récupérer les données de l'utilisateur depuis dataTransfer
    if (event.dataTransfer) {
      const userIdStr = event.dataTransfer.getData('userId');
      const userName = event.dataTransfer.getData('userName');
      
      if (!userIdStr) {
        console.error('Aucun ID utilisateur trouvé dans le transfert');
        return;
      }
      
      const userId = parseInt(userIdStr, 10);
      
      // Récupérer l'ID de la tâche depuis l'élément cible
      const taskId = targetElement.getAttribute('data-task-id');
      
      if (taskId) {
        const taskIdNum = parseInt(taskId, 10);
        // Trouver la tâche correspondante
        const task = this.taches.find(t => t.id === taskIdNum);
        
        if (task) {
          // Affecter l'utilisateur à la tâche
          this.assignUserToTask(userId, userName, task);
        }
      }
    }
  }

  assignUserToTask(userId: number, userName: string, task: Tache): void {
    // Mettre à jour la tâche avec le nouvel utilisateur responsable
    const updatedTask: Tache = {
      ...task,
      responsable: userId
    };
    
    // Appeler le service pour mettre à jour la tâche dans la base de données
    const updateSub = this.tacheService.update(task.id!, updatedTask).subscribe({
      next: () => {
        console.log(`Tâche "${task.titre}" assignée à ${userName}`);
        alert(`✅ Tâche "${task.titre}" assignée à ${userName}`);
        // Actualiser les données
        this.loadTaches();
        // Émettre l'événement pour informer d'autres composants
        this.userAssigned.emit({userId, userName, task: updatedTask});
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation de la tâche:', err);
        alert('❌ Erreur lors de l\'assignation de la tâche.');
      }
    });
    
    this.subscriptions.push(updateSub);
  }

  // Méthode appelée quand l'utilisateur est assigné depuis le composant de disponibilité
  onUserAssigned(event: {userId: number, userName: string, task?: Tache}): void {
    if (event.task) {
      this.assignUserToTask(event.userId, event.userName, event.task);
    }
  }

  /**
   * Récupère la couleur de fond en fonction du statut de la tâche
   */
  getBackgroundColorByStatus(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return '#f0ad4e';
      case 'EN_COURS': return '#5bc0de';
      case 'TERMINEE': return '#5cb85c';
      default: return '#0275d8';
    }
  }

  /**
   * Récupère la couleur de bordure en fonction de la priorité de la tâche
   */
  getBorderColorByPriority(priority: string): string {
    switch (priority) {
      case 'HAUTE': return '#d9534f';
      case 'BASSE': return '#5cb85c';
      default: return '#0275d8';
    }
  }

  /**
   * Gestion du drag-and-drop sur les jours du calendrier
   */
  handleDayDragOver(event: DragEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target?.classList.add('day-drag-over');
  }

  handleDayDragLeave(event: DragEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target?.classList.remove('day-drag-over');
  }
handleDayDrop(event: DragEvent, date: Date): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target?.classList.remove('day-drag-over');
    
    const taskId = event.dataTransfer?.getData('text/plain');
    if (!taskId) return;
    
    // Mise à jour de la date de la tâche
    const taskIdNum = parseInt(taskId, 10);
    const task = this.taches.find(t => t.id === taskIdNum);
    if (task) {
      task.dateDebut = new Date(date);
      // Mettre à jour la fin de la tâche si nécessaire
      if (task.dateFin) {
        const duration = task.dateFin.getTime() - (task.dateDebut?.getTime() || 0);
        task.dateFin = new Date(date.getTime() + duration);
      } else {
        // Par défaut, fin de tâche = début + 1 heure
        task.dateFin = new Date(date.getTime() + 3600000);
      }
      
      this.tacheService.update(taskIdNum, task).subscribe({
        next: () => {
          alert('✅ Tâche planifiée avec succès.');
          this.loadTaches();
        },
        error: (err) => {
          console.error('Erreur lors de la planification :', err);
          alert('❌ Échec de la planification de la tâche.');
        }
      });
    }
  }

  /**
   * Retourne les classes CSS en fonction du statut et de la priorité de la tâche
   */
  getTaskStatusClass(task: Tache): object {
    return {
      'task-pending': task.statut === 'EN_ATTENTE',
      'task-in-progress': task.statut === 'EN_COURS',
      'task-completed': task.statut === 'TERMINEE',
      'priority-high': task.priorite === 'HAUTE',
      'priority-normal': task.priorite === 'NORMALE',
      'priority-low': task.priorite === 'BASSE'
    };
  }

  /**
   * Ouvre les détails d'une tâche
   */
  openTaskDetails(task: Tache): void {
    console.log('Opening task details:', task);
    this.selectedTache = task;
    this.showPopup = true;
  }

  /**
   * Récupère le nom d'un utilisateur à partir de son ID
   */
  getUserName(userId: number): string {
    // Cette méthode devrait faire appel à un service pour récupérer le nom de l'utilisateur
    // Pour l'instant, on renvoie simplement l'ID sous forme de chaîne
    return userId.toString();
  }
}