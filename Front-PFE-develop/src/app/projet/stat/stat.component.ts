import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { TacheService } from '../../services/tache.service';
import { Tache } from '../../models/tache.models';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.css']
})
export class StatComponent implements OnInit {
  showDebug: any;

  tasks: Tache[] = [];
  public availableResponsables: number[] = [];
  public selectedResponsables: number[] = [];

  public barChartLabels: string[] = [];
  public barChartData: number[] = [];
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public projectProgressLabels: string[] = [];
  public projectProgressData: any[] = [];
  public projectProgressType: ChartType = 'line';
  public projectProgressOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      }
    }
  };

  public responsableStatsLabels: string[] = [];
  public responsableStatsData: any[] = [];
  public responsableStatsType: ChartType = 'bar';
  public responsableStatsOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false
      },
      y: {
        beginAtZero: true,
        stacked: false
      }
    }
  };

  public responsableRadarData: any = {};
  public responsableRadarType: ChartType = 'radar';
  public responsableRadarOptions: ChartOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  public availableProjects: string[] = [];
  public selectedProjects: string[] = [];
  public selectedYear: number = new Date().getFullYear();

  constructor(private tacheService: TacheService) {}

 ngOnInit(): void {
  this.selectedYear = new Date().getFullYear();
  this.loadStats();
  setTimeout(() => {
    console.log('🧪 Données bar chart:', this.barChartLabels, this.barChartData);
  }, 1000);
}

  loadStats() {
      console.log('🟢 loadStats appelé avec année sélectionnée:', this.selectedYear);

    this.validateSelectedYear();
    
    this.tacheService.getAll().subscribe(taches => {
    console.log('✅ Tâches récupérées depuis le service:', taches);
      this.tasks = taches || []; // Assurer que tasks n'est jamais undefined
      this.calculateStats();
      this.extractProjects();
      this.extractResponsables();
      this.calculateProjectProgress();
      this.updateResponsableStats();
    });
  }

  extractResponsables() {
    if (!this.tasks || this.tasks.length === 0) {
      this.availableResponsables = [];
      this.selectedResponsables = [];
      return;
    }

    const responsables = [
      ...new Set(this.tasks
        .map(t => t.responsable)
        .filter((r): r is number => typeof r === 'number' && r !== null && r !== undefined))
    ];
    
    console.log('Responsables extraits:', responsables);
    
    this.availableResponsables = responsables.sort((a, b) => a - b);
    this.selectedResponsables = this.availableResponsables.slice(0, Math.min(3, this.availableResponsables.length));
    
    console.log('Responsables sélectionnés par défaut:', this.selectedResponsables);
  }

calculateStats() {
  if (!this.tasks || this.tasks.length === 0) {
    this.barChartLabels = ['Terminées à temps', 'En retard', 'En cours', 'Terminées avant début'];
    this.barChartData = [0, 0, 0, 0];
    return;
  }

  let termineesATemps = 0;
  let enRetard = 0;
  let enCours = 0;
  let termineesAvantDebut = 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // date sans heure pour comparaison

  this.tasks.forEach(t => {
    if (!t.dateDebut || !t.dateFin) {
      console.warn('Tâche ignorée car dateDebut ou dateFin manquante', t);
      return;
    }

    const parseDate = (d: any) => {
      if (Array.isArray(d)) {
        return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
      } else {
        return new Date(d);
      }
    };

    const dateDebut = parseDate(t.dateDebut);
    const dateFin = parseDate(t.dateFin);

    const tempsPasse = t.tempsPasse || 0;
    const tempsEstime = t.tempsEstime || 0;

    if (t.statut === 'TERMINEE' && dateFin >= today) {
      // Tâche terminée à temps (dateFin >= aujourd'hui)
      termineesATemps++;
      console.log(`Tâche ${t.id} terminée à temps.`);
    } else if (tempsPasse === tempsEstime && today < dateDebut) {
      // Tâche terminée avant début
      termineesAvantDebut++;
      console.log(`Tâche ${t.id} terminée avant début.`);
    } else if (today > dateFin && tempsPasse < tempsEstime) {
      // Tâche en retard
      enRetard++;
      console.log(`Tâche ${t.id} en retard.`);
    } else {
      // Tâche en cours par défaut
      enCours++;
      console.log(`Tâche ${t.id} en cours.`);
    }
  });

  this.barChartLabels = ['Terminées à temps', 'En retard', 'En cours', 'Terminées avant début'];
  this.barChartData = [termineesATemps, enRetard, enCours, termineesAvantDebut];

  console.log('Statistiques mises à jour:', { termineesATemps, enRetard, enCours, termineesAvantDebut });
}


  extractProjects() {
      console.log('📦 Extraction des projets à partir des tâches...');

    if (!this.tasks || this.tasks.length === 0) {
          console.warn('⚠️ Aucune tâche, projets indisponibles');

      this.availableProjects = [];
      this.selectedProjects = [];
      return;
    }
  console.log('🧾 Projets disponibles:', this.availableProjects);

    const projects = [
      ...new Set(this.tasks
        .map(t => t.projet?.title)
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0))
    ];
    
    console.log('Projets extraits:', projects);
    
    this.availableProjects = projects;
    // Sélectionner tous les projets par défaut ou les 5 premiers
    this.selectedProjects = projects.slice(0, Math.min(5, projects.length));
    
    console.log('Projets sélectionnés par défaut:', this.selectedProjects);
  }

  calculateProjectProgress() {
    console.log('📈 Calcul de la progression mensuelle des projets...');
  console.log('🗓 Année sélectionnée:', this.selectedYear);
  console.log('📂 Projets sélectionnés:', this.selectedProjects);
  console.log('🗃 Tâches disponibles:', this.tasks);
    console.log('Calcul progression projets - Projets sélectionnés:', this.selectedProjects);
    
    if (!this.selectedProjects || this.selectedProjects.length === 0) {
      this.projectProgressLabels = [];
      this.projectProgressData = [];
      console.log('Aucun projet sélectionné, données vidées');
      return;
    }

    if (!this.tasks || this.tasks.length === 0) {
      this.projectProgressLabels = [];
      this.projectProgressData = [];
      console.log('Aucune tâche disponible');
      return;
    }

    this.projectProgressLabels = this.generateMonthLabels(this.selectedYear);
    console.log('Labels des mois générés:', this.projectProgressLabels);

    this.projectProgressData = this.selectedProjects.map((projectName, index) => {
      const projectTasks = this.tasks.filter(t => t.projet?.title === projectName);
      console.log(`Tâches pour le projet ${projectName}:`, projectTasks.length);
      
      const monthlyProgress = this.calculateMonthlyProgressForProject(projectTasks, this.selectedYear);
      console.log(`Progression mensuelle pour ${projectName}:`, monthlyProgress);

      return {
        label: projectName,
        data: monthlyProgress,
        borderColor: this.getColorByIndex(index),
        backgroundColor: this.getColorByIndex(index, 0.2),
        fill: false,
        tension: 0.1
      };
    });

    console.log('Données finales de progression des projets:', this.projectProgressData);
  }

  generateMonthLabels(year: number): string[] {
    return [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
  }

calculateMonthlyProgressForProject(tasks: Tache[], year: number): number[] {
  console.log(`📆 Calcul mensuel pour ${tasks.length} tâches en ${year}`);

  const monthlyProgress: number[] = [];

  for (let month = 0; month < 12; month++) {
    const endOfMonth = new Date(year, month + 1, 0);

    const relevantTasks = tasks.filter(task => {
      if (!task.dateDebut || !Array.isArray(task.dateDebut)) return false;
      const [y, m, d, h = 0, min = 0] = task.dateDebut;
      const taskDate = new Date(y, m - 1, d, h, min);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });

    console.log(`📅 Mois ${month + 1} → ${relevantTasks.length} tâches pertinentes`);

    if (relevantTasks.length === 0) {
      monthlyProgress.push(0);
      continue;
    }

    let totalProgress = 0;
    relevantTasks.forEach(task => {
      if (task.statut === 'TERMINEE') {
        const completionDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
        if (completionDate <= endOfMonth) {
          totalProgress += 100;
        }
      } else {
        const tempsPasse = task.tempsPasse || 0;
        const tempsEstime = task.tempsEstime || 1;
        const progress = Math.min((tempsPasse / tempsEstime) * 100, 90);
        totalProgress += progress;
      }
    });

    const average = totalProgress / relevantTasks.length;
    monthlyProgress.push(Math.round(average * 100) / 100);
  }

  return monthlyProgress;
}


  getColorByIndex(index: number, alpha: number = 1): string {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`,   // Rouge
      `rgba(54, 162, 235, ${alpha})`,   // Bleu
      `rgba(255, 205, 86, ${alpha})`,   // Jaune
      `rgba(75, 192, 192, ${alpha})`,   // Turquoise
      `rgba(153, 102, 255, ${alpha})`,  // Violet
      `rgba(255, 159, 64, ${alpha})`,   // Orange
      `rgba(199, 199, 199, ${alpha})`,  // Gris
      `rgba(83, 102, 255, ${alpha})`,   // Bleu foncé
    ];
    return colors[index % colors.length];
  }

  getRandomColor(alpha: number = 1): string {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 205, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`,
      `rgba(199, 199, 199, ${alpha})`,
      `rgba(83, 102, 255, ${alpha})`,
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onProjectSelectionChange(projects: string[]) {
    this.selectedProjects = projects;
    this.calculateProjectProgress();
  }

  onYearChange(year: any) {
      console.log('🔄 Changement année:', year);

    const numericYear = typeof year === 'string' ? parseInt(year, 10) : Number(year);
    
    if (!isNaN(numericYear)) {
      this.selectedYear = numericYear;
      this.calculateProjectProgress();
    } else {
      console.error('Année invalide:', year);
      this.selectedYear = new Date().getFullYear();
    }
  }

  validateSelectedYear(): void {
    if (isNaN(this.selectedYear) || this.selectedYear < 1900 || this.selectedYear > 2100) {
      console.warn('selectedYear est invalide:', this.selectedYear);
      this.selectedYear = new Date().getFullYear();
    }
  }

 getAvailableYears(): number[] {
  if (!this.tasks || this.tasks.length === 0) {
    return [new Date().getFullYear()];
  }

  const parseDate = (d: any) => {
    if (Array.isArray(d)) {
      return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
    } else {
      return new Date(d);
    }
  };

  const years = new Set<number>();

  this.tasks.forEach(task => {
    if (task.dateDebut) {
      const dateDebut = parseDate(task.dateDebut);
      if (!isNaN(dateDebut.getTime())) {
        years.add(dateDebut.getFullYear());
      }
    }
    if (task.dateFin) {
      const dateFin = parseDate(task.dateFin);
      if (!isNaN(dateFin.getTime())) {
        years.add(dateFin.getFullYear());
      }
    }
  });

  const yearArray = Array.from(years).sort((a, b) => b - a);

  if (yearArray.length === 0) {
    yearArray.push(new Date().getFullYear());
  }

  return yearArray;
}



  onProjectCheckboxChange(project: string, event: any) {
      console.log('📌 Changement projet:', project, '✅', event.target.checked);

    if (event.target.checked) {
      if (!this.selectedProjects.includes(project)) {
        this.selectedProjects.push(project);
      }
    } else {
      this.selectedProjects = this.selectedProjects.filter(p => p !== project);
    }
    console.log('Projets sélectionnés après changement:', this.selectedProjects);
    this.calculateProjectProgress();
  }

  // MÉTHODES POUR LES RESPONSABLES

  onResponsableCheckboxChange(responsable: number, event: Event): void {
      console.log('📌 Changement responsable:', responsable, '✅', (event.target as HTMLInputElement).checked);

    const isChecked = (event.target as HTMLInputElement).checked;
    
    console.log('Checkbox responsable changé:', responsable, isChecked);
    
    if (isChecked) {
      if (!this.selectedResponsables.includes(responsable)) {
        this.selectedResponsables.push(responsable);
      }
    } else {
      this.selectedResponsables = this.selectedResponsables.filter(r => r !== responsable);
    }

    console.log('Responsables sélectionnés après changement:', this.selectedResponsables);
    
    this.updateResponsableStats();
  }

  updateResponsableStats(): void {
      console.log('👥 Mise à jour des stats pour responsables:', this.selectedResponsables);

    console.log('Mise à jour des stats responsables, sélectionnés:', this.selectedResponsables);
    
    if (this.selectedResponsables.length === 0) {
      this.responsableStatsLabels = [];
      this.responsableStatsData = [];
      this.responsableRadarData = {};
      return;
    }

    this.responsableStatsLabels = this.selectedResponsables.map(r => `Responsable ${r}`);
    
    this.responsableStatsData = [
      {
        label: 'Tâches Terminées',
        data: this.selectedResponsables.map(r => this.getResponsableCompletedCount(r)),
        backgroundColor: '#2ecc71'
      },
      {
        label: 'Tâches En Cours',
        data: this.selectedResponsables.map(r => this.getResponsableInProgressCount(r)),
        backgroundColor: '#f39c12'
      },
      {
        label: 'Tâches En Retard',
        data: this.selectedResponsables.map(r => this.getResponsableOverdueCount(r)),
        backgroundColor: '#e74c3c'
      }
    ];

    console.log('Stats données:', this.responsableStatsData);

    if (this.selectedResponsables.length > 1) {
      this.responsableRadarData = {
        labels: ['Productivité', 'Ponctualité', 'Efficacité', 'Charge', 'Qualité'],
        datasets: this.selectedResponsables.map((r, index) => ({
          label: `Responsable ${r}`,
          data: [
            this.getResponsableProductivity(r),
            this.getResponsablePunctuality(r),
            this.getResponsableEfficiency(r),
            this.getResponsableWorkload(r),
            this.getResponsableQuality(r)
          ],
          backgroundColor: this.getColorByIndex(index, 0.2),
          borderColor: this.getColorByIndex(index),
          borderWidth: 2
        }))
      };
    } else {
      this.responsableRadarData = {};
    }
  }

  // MÉTHODES DE CALCUL POUR LES RESPONSABLES

  getResponsableTaskCount(responsable: number): number {
    if (!this.tasks) return 0;
    return this.tasks.filter(t => t.responsable === responsable).length;
  }
getTaskStatus(t: Tache): 'TERMINEE_A_TEMPS' | 'EN_RETARD' | 'EN_COURS' | 'TERMINEE_AVANT_DEBUT' | 'AUTRE' {
  const parseDate = (d: any) => {
    if (Array.isArray(d)) {
      return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
    } else {
      return new Date(d);
    }
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDebut = t.dateDebut ? parseDate(t.dateDebut) : null;
  const dateFin = t.dateFin ? parseDate(t.dateFin) : null;
  const tempsPasse = t.tempsPasse || 0;
  const tempsEstime = t.tempsEstime || 0;

  if (!dateDebut || !dateFin) return 'AUTRE';

  if (t.statut === 'TERMINEE' && dateFin >= today) {
    return 'TERMINEE_A_TEMPS';
  } else if (tempsPasse === tempsEstime && today < dateDebut) {
    return 'TERMINEE_AVANT_DEBUT';
  } else if (today > dateFin && tempsPasse < tempsEstime) {
    return 'EN_RETARD';
  } else {
    return 'EN_COURS';
  }
}

getResponsableCompletedCount(responsable: number): number {
  return this.tasks.filter(t =>
    t.responsable === responsable &&
    ['TERMINEE_A_TEMPS', 'TERMINEE_AVANT_DEBUT'].includes(this.getTaskStatus(t))
  ).length;
}


getResponsableInProgressCount(responsable: number): number {
  return this.tasks.filter(t =>
    t.responsable === responsable &&
    this.getTaskStatus(t) === 'EN_COURS'
  ).length;
}

getResponsableOverdueCount(responsable: number): number {
  return this.tasks.filter(t =>
    t.responsable === responsable &&
    this.getTaskStatus(t) === 'EN_RETARD'
  ).length;
}

  getResponsableTotalTime(responsable: number): number {
    if (!this.tasks) return 0;
    const responsableTasks = this.tasks.filter(t => t.responsable === responsable);
    return responsableTasks.reduce((total, task) => total + (task.tempsPasse || 0), 0);
  }

  getResponsableAverageProgress(responsable: number): number {
    if (!this.tasks) return 0;
    const responsableTasks = this.tasks.filter(t => t.responsable === responsable);
    if (responsableTasks.length === 0) return 0;

    let totalProgress = 0;
    responsableTasks.forEach(task => {
      if (task.statut === 'TERMINEE') {
        totalProgress += 100;
      } else {
        const tempsPasse = task.tempsPasse || 0;
        const tempsEstime = task.tempsEstime || 1;
        totalProgress += Math.min((tempsPasse / tempsEstime) * 100, 90);
      }
    });

    return Math.round((totalProgress / responsableTasks.length) * 100) / 100;
  }

  getResponsableProductivity(responsable: number): number {
      console.log(`⚙️ Calcul productivité pour Responsable ${responsable}`);

    const completedTasks = this.getResponsableCompletedCount(responsable);
    const totalTasks = this.getResponsableTaskCount(responsable);
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }

 getResponsablePunctuality(responsable: number): number {
  const today = new Date();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const responsableTasks = this.tasks.filter(t =>
    t.responsable === responsable && t.statut === 'TERMINEE'
  );

  if (responsableTasks.length === 0) return 0;

  const onTime = responsableTasks.filter(t => {
    if (!t.dateFin) return false;
    const dateFin = new Date(t.dateFin);
    return dateFin >= currentDay;
  });

  return (onTime.length / responsableTasks.length) * 100;
}


  getResponsableEfficiency(responsable: number): number {
    if (!this.tasks) return 0;
    const responsableTasks = this.tasks.filter(t => t.responsable === responsable && t.statut === 'TERMINEE');
    if (responsableTasks.length === 0) return 0;

    let totalEfficiency = 0;
    let validTasks = 0;

    responsableTasks.forEach(task => {
      const tempsPasse = task.tempsPasse || 0;
      const tempsEstime = task.tempsEstime || 0;
      
      if (tempsEstime > 0 && tempsPasse > 0) {
        const efficiency = Math.min((tempsEstime / tempsPasse) * 100, 100);
        totalEfficiency += efficiency;
        validTasks++;
      }
    });

    return validTasks > 0 ? totalEfficiency / validTasks : 0;
  }

  getResponsableWorkload(responsable: number): number {
    const totalTasks = this.getResponsableTaskCount(responsable);
    
    if (this.availableResponsables.length === 0) return 0;
    
    const allTaskCounts = this.availableResponsables.map(r => this.getResponsableTaskCount(r));
    const maxTasks = Math.max(...allTaskCounts, 1);
    
    return (totalTasks / maxTasks) * 100;
  }

  getResponsableQuality(responsable: number): number {
    const completedTasks = this.getResponsableCompletedCount(responsable);
    const overdueTasks = this.getResponsableOverdueCount(responsable);
    const totalTasks = this.getResponsableTaskCount(responsable);
    
    if (totalTasks === 0) return 0;
    
    const qualityScore = ((completedTasks - overdueTasks) / totalTasks) * 100;
    return Math.max(0, qualityScore);
  }

  // MÉTHODES POUR LES PROJETS

  getProjectTaskCount(projectName: string): number {
    if (!this.tasks) return 0;
    return this.tasks.filter(t => t.projet?.title === projectName).length;
  }

  getProjectCompletedCount(projectName: string): number {
    if (!this.tasks) return 0;
    return this.tasks.filter(t => t.projet?.title === projectName && t.statut === 'TERMINEE').length;
  }

  getProjectInProgressCount(projectName: string): number {
    if (!this.tasks) return 0;
    const now = new Date();
    return this.tasks.filter(t =>
      t.projet?.title === projectName &&
      t.statut !== 'TERMINEE' &&
      t.dateFin &&
      new Date(t.dateFin) >= now
    ).length;
  }

  getProjectOverdueCount(projectName: string): number {
    if (!this.tasks) return 0;
    const now = new Date();
    return this.tasks.filter(t =>
      t.projet?.title === projectName &&
      t.statut !== 'TERMINEE' &&
      t.dateFin &&
      new Date(t.dateFin) < now
    ).length;
  }

  getProjectAverageProgress(projectName: string): number {
    if (!this.tasks) return 0;
    const projectTasks = this.tasks.filter(t => t.projet?.title === projectName);
    if (projectTasks.length === 0) return 0;

    let totalProgress = 0;
    projectTasks.forEach(task => {
      if (task.statut === 'TERMINEE') {
        totalProgress += 100;
      } else {
        const tempsPasse = task.tempsPasse || 0;
        const tempsEstime = task.tempsEstime || 1;
        totalProgress += Math.min((tempsPasse / tempsEstime) * 100, 90);
      }
    });

    return Math.round((totalProgress / projectTasks.length) * 100) / 100;
  }
}