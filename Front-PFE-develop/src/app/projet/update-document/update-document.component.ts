import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Document } from '../../models/document.models';

@Component({
  selector: 'app-update-document',
  templateUrl: './update-document.component.html',
  styleUrls: ['./update-document.component.css']
})
export class UpdateDocumentComponent implements OnInit {
  documentForm: FormGroup;
  documentId!: number;
  dossierId!: number;
  projetId!: number;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  existingFileName: string = '';
  isLoading: boolean = false;
  fileControl = new FormControl<string | null>(null);
  existingFileUrl: string = '';
  existingDocument: Document | null = null; // Variable pour stocker le document existant

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.documentForm = this.fb.group({
      name: ['', [Validators.required]],
      file: this.fileControl
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projetId = +params['projetId'];
      this.dossierId = +params['dossierId'];
      this.documentId = +params['documentId'];

      if (isNaN(this.projetId) || isNaN(this.dossierId) || isNaN(this.documentId)) {
        this.errorMessage = 'Invalid document or project IDs';
        return;
      }

      this.loadDocument();
    });
  }

  // Charge les informations du document
  loadDocument(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.documentService.getDocumentById(this.documentId).subscribe({
      next: (response: Document) => {
        if (response && (response.id !== null || response.name)) {
          this.documentForm.patchValue({
            name: response.name
          });
          this.existingFileName = response.fileName || this.extractFileNameFromUrl(response.url);
          this.existingFileUrl = response.url || '';
          this.existingDocument = response; // Stockage du document existant
        } else {
          this.errorMessage = 'Invalid document format received';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load document';
        this.isLoading = false;
        console.error('Error loading document:', err);
      }
    });
  }

  // Extrait le nom du fichier à partir de l'URL
  private extractFileNameFromUrl(url: string): string {
    if (!url) return '';
    try {
      const segments = url.split(/[\\/]/);
      return segments[segments.length - 1] || '';
    } catch {
      return '';
    }
  }

  // Gère le changement de fichier
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.fileControl.setValue(this.selectedFile.name);
    } else {
      this.selectedFile = null;
      this.fileControl.setValue(null);
    }
  }

  // Soumettre le formulaire de mise à jour
  onSubmit(): void {
    if (this.documentForm.invalid) {
      this.markFormGroupTouched(this.documentForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const updateData = {
      name: this.documentForm.get('name')?.value,
      file: this.selectedFile || undefined
    };

    if (this.existingDocument) {
      this.documentService.updateDocument(
        this.documentId,
        this.dossierId,
        updateData,
        this.existingDocument // Passer le document existant ici
      ).subscribe({
        next: () => {
          this.router.navigate([
            '/dossiers/projets',
            this.projetId,
            'dossiers',
            this.dossierId,
            'documents'
          ]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update document';
          console.error('Update error:', error);
        }
      });
    }
  }

  // Marque tous les champs du formulaire comme touchés
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Annuler la mise à jour et revenir à la page précédente
  onCancel(): void {
    this.router.navigate([
      '/dossiers/projets',
      this.projetId,
      'dossiers',
      this.dossierId,
      'documents'
    ]);
  }

  // Télécharger le fichier existant
  downloadCurrentFile(): void {
    if (!this.existingFileUrl) {
      this.errorMessage = 'No file available to download';
      return;
    }

    this.documentService.downloadFile(this.existingFileUrl).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.existingFileName || 'document';
        document.body.appendChild(a);
        a.click();
        window.setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      error: (err) => {
        this.errorMessage = 'Failed to download file';
        console.error('Download error:', err);
      }
    });
  }
}
