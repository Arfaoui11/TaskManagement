import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Tache } from '../../models/tache.models';
import { UserService } from '../../services/user.service';

interface UserAvailability {
  userId: number;
  fullName: string;
  dailyHours: {
    [date: string]: number; // Format: 'YYYY-MM-DD'
  };
  isAvailable: {
    [date: string]: boolean; // Format: 'YYYY-MM-DD'
  };
}

@Component({
  selector: 'app-user-availability',
  templateUrl: './user-availability.component.html',
  styleUrls: ['./user-availability.component.css']
})
export class UserAvailabilityComponent implements OnInit, OnChanges {
  @Input() taches: Tache[] = [];
  @Input() selectedDate: Date | null = null;

  // Données des utilisateurs
  users: any[] = [];
  // Disponibilité des utilisateurs par jour
  userAvailability: UserAvailability[] = [];
  // Dates à afficher
  displayDates: string[] = [];
  // Heures maximum par jour
  maxHoursPerDay = 8;
  
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

 ngOnChanges(changes: SimpleChanges): void {
  // Lorsque les tâches ou la date sélectionnée changent, recalculer
  if ((changes['taches'] && !changes['taches'].firstChange) || 
      (changes['selectedDate'] && !changes['selectedDate'].firstChange)) {
    this.calculateUserAvailability();
  }
}


  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calculateUserAvailability();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    });
  }

  calculateUserAvailability(): void {
    // Si nous n'avons pas d'utilisateurs ou de tâches, sortir
    if (!this.users.length || !this.taches.length) return;

    // Initialiser la plage de dates à afficher
    this.initializeDateRange();

    // Initialiser les objets de disponibilité des utilisateurs
    this.userAvailability = this.users.map(user => ({
      userId: user.id,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`,
      dailyHours: {},
      isAvailable: {}
    }));

    // Initialiser les dates pour tous les utilisateurs
    this.userAvailability.forEach(user => {
      this.displayDates.forEach(date => {
        user.dailyHours[date] = 0;
        user.isAvailable[date] = true;
      });
    });

    // Date du jour pour les calculs (à minuit)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrer les tâches avec des dates et un responsable
    const tasksWithDates = this.taches.filter(task => 
      task.dateDebut && task.dateFin && task.responsable !== undefined);

    // Pour chaque tâche
    tasksWithDates.forEach(task => {
      if (!task.dateDebut || !task.dateFin || task.responsable === undefined) return;

      const startDate = new Date(task.dateDebut);
      const endDate = new Date(task.dateFin);
      const userIndex = this.userAvailability.findIndex(u => u.userId === task.responsable);
      
      if (userIndex === -1) return; // Utilisateur non trouvé
      
      // Calculer les jours passés et futurs
      // Compter les jours passés (avant aujourd'hui)
      let pastDays = 0;
      let futureDays = 0;
      
      const taskStartClone = new Date(startDate);
      while (taskStartClone < today && taskStartClone <= endDate) {
        pastDays++;
        taskStartClone.setDate(taskStartClone.getDate() + 1);
      }
      
      // Compter les jours futurs (aujourd'hui inclus)
      const taskEndClone = new Date(Math.max(today.getTime(), startDate.getTime()));
      while (taskEndClone <= endDate) {
        futureDays++;
        taskEndClone.setDate(taskEndClone.getDate() + 1);
      }

      // Temps déjà passé et temps restant
      const timeSpent = task.tempsPasse || 0;
      const totalEstimatedTime = task.tempsEstime || 0;
      const remainingTime = Math.max(0, totalEstimatedTime - timeSpent);
      
      // Traiter chaque jour de la durée de la tâche
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = this.formatDate(currentDate);
        
        if (this.displayDates.includes(dateKey)) {
          let hoursForDay = 0;
          
          // Déterminer si c'est un jour passé ou futur
          const isPastDay = currentDate < today;
          
          if (isPastDay) {
            // Pour les jours passés, répartir le temps déjà travaillé
            hoursForDay = pastDays > 0 ? timeSpent / pastDays : 0;
          } else {
            // Pour les jours futurs (ou aujourd'hui), répartir le temps restant
            hoursForDay = futureDays > 0 ? remainingTime / futureDays : 0;
          }
          
          // Ajouter les heures pour cet utilisateur ce jour-ci
          if (!this.userAvailability[userIndex].dailyHours[dateKey]) {
            this.userAvailability[userIndex].dailyHours[dateKey] = 0;
          }
          this.userAvailability[userIndex].dailyHours[dateKey] += hoursForDay;
          
          // Vérifier si l'utilisateur a dépassé les heures max
          if (this.userAvailability[userIndex].dailyHours[dateKey] >= this.maxHoursPerDay) {
            this.userAvailability[userIndex].isAvailable[dateKey] = false;
          }
        }
        
        // Passer au jour suivant
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  // Calcule le nombre de jours entre deux dates (inclusif)
  getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // Millisecondes dans une journée
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / oneDay) + 1; // +1 pour inclure le jour de début
  }

  initializeDateRange(): void {
    // Par défaut, montrer la semaine en cours si aucune date n'est sélectionnée
    const baseDate = this.selectedDate || new Date();
    
    // Obtenir le début de la semaine (dimanche)
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() - baseDate.getDay());
    
    // Générer un tableau de dates à afficher (7 jours)
    this.displayDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.displayDates.push(this.formatDate(date));
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Obtenir les utilisateurs disponibles pour une date spécifique
  getAvailableUsers(date: string): UserAvailability[] {
    return this.userAvailability.filter(user => user.isAvailable[date]);
  }

  // Obtenir la date formatée pour l'affichage
  getDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  // Calculer les heures restantes disponibles pour un utilisateur à une date spécifique
  getRemainingHours(user: UserAvailability, date: string): number {
    return Math.max(0, this.maxHoursPerDay - (user.dailyHours[date] || 0));
  }

  // Navigation dans les semaines
  navigatePreviousWeek(): void {
    if (this.displayDates.length > 0) {
      const firstDate = new Date(this.displayDates[0]);
      firstDate.setDate(firstDate.getDate() - 7);
      this.selectedDate = firstDate;
      this.initializeDateRange();
      this.calculateUserAvailability();
    }
  }

  navigateNextWeek(): void {
    if (this.displayDates.length > 0) {
      const lastDate = new Date(this.displayDates[this.displayDates.length - 1]);
      lastDate.setDate(lastDate.getDate() + 1);
      this.selectedDate = lastDate;
      this.initializeDateRange();
      this.calculateUserAvailability();
    }
  }
}