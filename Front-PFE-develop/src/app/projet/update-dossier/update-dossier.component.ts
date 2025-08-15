import { Component } from '@angular/core';
import { Dossier } from '../../models/dossier.models';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../services/dossier.service';

@Component({
  selector: 'app-update-dossier',
  templateUrl: './update-dossier.component.html',
  styleUrl: './update-dossier.component.css'
})
export class UpdateDossierComponent {
  dossier!: Dossier;
  projetId!: number;
  dossierId!: number;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private dossierService: DossierService
  ) {}

  ngOnInit(): void {
    this.projetId = +this.route.snapshot.paramMap.get('projetId')!;
    this.dossierId = +this.route.snapshot.paramMap.get('dossierId')!;

    this.dossierService.getDossierById(this.dossierId).subscribe(
      (data) => {
        this.dossier = data;
      },
      (error) => {
        console.error('Erreur lors du chargement du dossier :', error);
      }
    );
  }

  onSave(): void {
    this.dossierService.updateDossier(this.dossierId, this.dossier).subscribe(
      () => {
        this.router.navigate(['/dossiers/projets', this.projetId]);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du dossier :', error);
      }
    );
  }
}
