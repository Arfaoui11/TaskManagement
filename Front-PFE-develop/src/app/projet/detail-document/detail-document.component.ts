import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-document',
  templateUrl: './detail-document.component.html',
  styleUrls: ['./detail-document.component.css'],
})
export class DetailDocumentComponent implements OnInit {
  document: Document | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  decodedContent: string = '';
  safeUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const documentId = this.route.snapshot.paramMap.get('documentId');
    
    if (documentId) {
      const docId = Number(documentId);
      if (!isNaN(docId)) {
        this.loadDocument(docId);
      } else {
        this.handleError("L'ID du document est invalide.");
      }
    } else {
      this.handleError("ID du document non trouvé dans l'URL.");
    }
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  loadDocument(documentId: number): void {
    this.documentService.getDocumentById(documentId).subscribe({
      next: (apiResponse: any) => {
        // Transform API response to match Document interface
        const document: Document = {
          id: apiResponse.id || documentId,
          name: apiResponse.name || 'Sans nom',
          type: apiResponse.type || 'application/octet-stream',
          url: apiResponse.url || apiResponse.fileUrl || '',
          fileName: apiResponse.fileName || this.extractFileName(apiResponse.url),
          archived: apiResponse.archived || false,
          createdAt: apiResponse.createdAt ? new Date(apiResponse.createdAt) : new Date(),
          fileSize: apiResponse.fileSize ? Number(apiResponse.fileSize) : undefined,
          content: apiResponse.content,
          dossier: apiResponse.dossier,
          userId: 0,
          parentId: 0,
          pageCount: 0
        };
        
        this.document = document;
        this.isLoading = false;
        
     
      },
      error: (error) => {
        this.handleError("Erreur lors du chargement du document.");
        console.error('Erreur lors du chargement du document :', error);
      }
    });
  }

  private extractFileName(url: string): string | undefined {
    try {
      return url.split('/').pop()?.split('?')[0];
    } catch {
      return undefined;
    }
  }

  isTextType(type: string): boolean {
    return type.startsWith('text/');
  }

  isPreviewableType(type: string): boolean {
    return type === 'application/pdf' || type.startsWith('image/');
  }

  getSafeUrl(base64Data: string, contentType: string): SafeResourceUrl {
    const dataUrl = `data:${contentType};base64,${base64Data}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
  }

  downloadFile(): void {
    if (!this.document) return;

    const fileName = this.document.fileName || this.extractFileName(this.document.url);
    if (!fileName) {
      this.handleError("Impossible de déterminer le nom du fichier.");
      return;
    }

    this.documentService.downloadFile(fileName).subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document?.name || fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du document :', error);
        this.handleError("Erreur lors du téléchargement du document.");
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/documents']);
  }
}