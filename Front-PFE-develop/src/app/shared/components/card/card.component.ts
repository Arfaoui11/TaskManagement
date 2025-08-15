import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Dossier } from '../../../models/dossier.models';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() dossier!: Dossier; // Input property for Dossier
  @Input() debugMode: boolean = false; // Optional debug mode
  @Output() viewDetails = new EventEmitter<Dossier>(); // Output event for viewing details
  @Output() delete = new EventEmitter<Dossier>(); // Output event for deleting

  onViewDetails() {
    this.viewDetails.emit(this.dossier); // Emit Dossier object
  }

  onDelete() {
    this.delete.emit(this.dossier); // Emit Dossier object
  }
}