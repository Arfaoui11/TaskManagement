import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-document',
  templateUrl: './create-document.component.html',
  styleUrls: ['./create-document.component.css']
})
export class CreateDocumentComponent implements OnInit {
  createForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  maxSizeMB = 10;
  selectedFile: File | null = null;
  formSubmitAttempted = false;
  projetId: number | null;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      file: [null, Validators.required],
      description: [''],
      parentId: [null]
    });
  }

  ngOnInit(): void {
    console.log('Create Document Component initialized');
    
    // Debug: Afficher toutes les informations de route
    console.log('Route params:', this.route.snapshot.paramMap.keys);
    console.log('Query params:', this.route.snapshot.queryParamMap.keys);
    
    // Afficher les valeurs spécifiques
    const projetIdParam = this.route.snapshot.paramMap.get('projetId');
    const dossierIdParam = this.route.snapshot.paramMap.get('dossierId') || 
                          this.route.snapshot.queryParamMap.get('dossierId');
      this.projetId = projetIdParam && projetIdParam.trim() !== '' ? Number(projetIdParam) : null;

    console.log('projetId from params:', projetIdParam);
    console.log('dossierId from params:', dossierIdParam);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    console.log('File selected:', file);

    if (file) {
      if (!this.allowedTypes.includes(file.type)) {
        this.errorMessage = `Type de fichier non supporté: ${file.type}`;
        this.createForm.get('file')?.reset();
        console.error('Unsupported file type:', file.type);
        return;
      }

      if (file.size > this.maxSizeMB * 1024 * 1024) {
        this.errorMessage = `Fichier trop volumineux (max ${this.maxSizeMB}MB)`;
        this.createForm.get('file')?.reset();
        console.error('File size exceeds maximum limit:', file.size);
        return;
      }

      this.selectedFile = file;
      this.createForm.patchValue({ file });
      this.createForm.get('file')?.updateValueAndValidity();
      this.errorMessage = '';

      console.log('File selected successfully:', file.name, file.type, file.size);
    }
  }

  onSubmit(): void {
    this.formSubmitAttempted = true;
    this.errorMessage = '';
    console.log('Form submitted, checking validity...');

    if (this.createForm.invalid) {
      Object.keys(this.createForm.controls).forEach(key => {
        const control = this.createForm.get(key);
        if (control?.invalid) {
          console.error(`Control ${key} is invalid:`, control.errors);
        }
      });
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier';
      console.warn('No file selected');
      return;
    }

    this.isLoading = true;

    const formValues = this.createForm.value;
    const userId = this.authService.getUserInfo()?.id;
    if (!userId) {
      this.isLoading = false;
      this.errorMessage = 'Utilisateur non authentifié';
      return;
    }

    // Récupération des paramètres de route
    const route = this.route.snapshot;
    const dossierIdParam = route.paramMap.get('dossierId') || route.queryParamMap.get('dossierId');
    const projetIdParam = route.paramMap.get('projetId') || route.queryParamMap.get('projetId');
    
    console.log('Raw params - dossierId:', dossierIdParam, 'projetId:', projetIdParam);

    // Conversion en number seulement si la valeur existe et n'est pas vide
    const dossierId: number | null = (dossierIdParam && dossierIdParam.trim() !== '') ? Number(dossierIdParam) : null;
    const projetId: number | null = (projetIdParam && projetIdParam.trim() !== '') ? Number(projetIdParam) : null;

    console.log('Converted params - dossierId:', dossierId, 'projetId:', projetId);

    // Vérification que l'un des deux existe
    if (dossierId === null && projetId === null) {
      this.isLoading = false;
      this.errorMessage = 'Aucun identifiant de dossier ou de projet fourni.';
      console.error('Missing dossierId and projetId in route');
      return;
    }

    const parentIdRaw = formValues.parentId;
    const parentId: number | null = parentIdRaw ? Number(parentIdRaw) : null;

    console.log('Sending document data:', {
      name: formValues.name,
      userId,
      dossierId,
      parentId,
      fileName: this.selectedFile?.name,
      projetId
    });

    // Appel du service avec les bonnes valeurs (null au lieu de 0 par défaut)
    this.documentService.uploadDocument(
      formValues.name,
      this.selectedFile,
      dossierId, // Peut être null
      userId,
      parentId,
      projetId   // Peut être null
    )
    .subscribe({
      next: (newDocument) => {
        this.isLoading = false;
        this.successMessage = 'Document créé avec succès!';
        
        // Redirection intelligente
        if (projetId !== null) {
          this.router.navigate([`/dossiers-documents/projets/${projetId}`]);
        } else if (dossierId !== null) {
          this.router.navigate([`/dossiers-documents/dossiers/${dossierId}`]);
        } else {
          this.router.navigate(['/dossiers-documents']);
        }
        
        this.createForm.reset();
        this.selectedFile = null;
        this.formSubmitAttempted = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Upload error:', err);
        if (err.error && err.error.message) {
          this.errorMessage = `Erreur: ${err.error.message}`;
        } else {
          this.errorMessage = 'Erreur lors de la création du document';
        }
      }
    });
  }

  get formControls() {
    return this.createForm.controls;
  }
onCancel() {
    if (this.projetId) {
            this.router.navigate(['dossiers-documents/projets/', this.projetId]);

    } else {
      this.router.navigate(['/']);
    }
  }
}