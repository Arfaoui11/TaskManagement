import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Document } from '../../models/document.models';

@Component({
  selector: 'app-document-modal',
  templateUrl: './document-modal.component.html',
  styleUrls: ['./document-modal.component.css']
})
export class DocumentModalComponent implements OnInit {
  showDetails = false;
  loading = true;
  error: string | null = null;
  safePdfUrl: SafeResourceUrl | null = null;
  isLargePdf = false; // Nouvelle propriété pour gérer la taille du PDF

  constructor(
    public dialogRef: MatDialogRef<DocumentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      document: Document;
      url: string;
      type: string;
      name: string;
    },
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Auto-show details 
    // for small documents or text files
    console.log('safePdfUrl:', this.safePdfUrl);
console.log('PDF base64 start:', this.data.document?.content?.substring(0, 30));

    if (this.isText() || (this.data.document?.content && this.data.document.content.length < 10000)) {
      this.showDetails = true;
    }

    // Auto-agrandir le PDF par défaut
    if (this.isPdf()) {
      this.isLargePdf = true;
    }

    // Prepare PDF URL if needed
    if (this.isPdf()) {
      this.preparePdfUrl();
        console.log('safePdfUrl après création:', this.safePdfUrl);

    } else {
      this.loading = false;
    }
  }

private preparePdfUrl(): void {
  if (this.data.document?.content) {
    const pdfDataUrl = `data:application/pdf;base64,${this.data.document.content}`;
this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${this.data.document.content}`);
    console.log('Base64 OK:', pdfDataUrl.slice(0, 50));
  } else if (this.data.url) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
    console.log('URL OK:', this.data.url);
  } else {
    console.warn('Pas de contenu PDF ni d\'URL');
  }

  this.loading = false;
}


  toggleDetailsPanel(): void {
    this.showDetails = !this.showDetails;
  }

  // Nouvelle méthode pour basculer la taille du PDF
  togglePdfSize(): void {
    this.isLargePdf = !this.isLargePdf;
  }

  // Type checking methods
  isPdf(): boolean {
    const type = this.data.type?.toLowerCase();
    return type?.includes('pdf') || 
           this.data.document?.fileName?.toLowerCase().endsWith('.pdf') || 
           false;
  }

  isImage(): boolean {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(this.data.type?.toLowerCase()) || 
           ['jpg', 'jpeg', 'png', 'gif'].some(ext => 
             this.data.document?.fileName?.toLowerCase().endsWith(ext));
  }

  isText(): boolean {
    const textTypes = ['text/plain', 'application/json', 'text/xml', 'application/javascript', 'text/css', 'text/html'];
    return textTypes.includes(this.data.type?.toLowerCase()) || 
           ['txt', 'json', 'xml', 'js', 'css', 'html'].some(ext => 
             this.data.document?.fileName?.toLowerCase().endsWith(ext));
  }

  isSupportedType(): boolean {
    return this.isPdf() || this.isImage() || this.isText();
  }

  // Document handling methods
  getFileSize(): string {
    if (!this.data.document?.content) return 'Taille inconnue';
    
    const base64Length = this.data.document.content.length;
    const padding = (this.data.document.content.match(/=/g) || []).length;
    const sizeInBytes = Math.floor((base64Length * 3) / 4) - padding;
    
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

formatDate(date: Date | string | null): string {
    if (!date) return 'Date non disponible';

    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
    } else {
      d = date;
    }

    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }

    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
formatDateCustom(value: any): string {
  if (!value) return 'Date non disponible';

  // 1. Si c'est un tableau [year, month, day, hour, min, sec, nanos]
  if (Array.isArray(value) && value.length >= 6) {
    const [year, month, day, hour, minute, second] = value;
    const date = new Date(year, month - 1, day, hour, minute, second);

    if (isNaN(date.getTime())) return 'Date invalide';

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 2. Si c'est une Date classique
  if (value instanceof Date) {
    return value.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 3. Si c'est une chaîne ISO
  if (typeof value === 'string') {
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return 'Format inconnu';
}





  // UI helpers
  getDocumentIcon(): string {
    if (this.isPdf()) return 'picture_as_pdf';
    if (this.isImage()) return 'image';
    if (this.isText()) return 'description';
    return 'insert_drive_file';
  }

  getFileTypeDisplay(): string {
    if (this.isPdf()) return 'Document PDF';
    if (this.isImage()) return 'Image';
    if (this.isText()) return 'Document Texte';
    return this.data.type || 'Type inconnu';
  }

  getTextContent(): string {
    if (!this.isText() || !this.data.document?.content) return '';
    
    try {
      return atob(this.data.document.content);
    } catch (error) {
      return 'Erreur lors du décodage du texte';
    }
  }

  // Document actions
  downloadDocument(): void {
    if (!this.data.document?.content) return;
    
    try {
      const byteCharacters = atob(this.data.document.content);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: this.data.type || 'application/octet-stream' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.data.document.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      this.error = 'Erreur lors du téléchargement';
    }
  }

  // Error handling
  onDocumentError(event: any): void {
    this.loading = false;
    this.error = 'Erreur lors du chargement du document';
    console.error('Document loading error:', event);
  }

  onImageError(event: any): void {
    this.loading = false;
    this.error = 'Impossible de charger l\'image';
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  retryLoad(): void {
    this.loading = true;
    this.error = null;
    if (this.isPdf()) {
      this.preparePdfUrl();
    }
  }

  // Metadata and location
  getBreadcrumb(): string[] {
    const breadcrumb: string[] = [];
    
    if (this.data.document?.projet?.title) {
      breadcrumb.push(this.data.document.projet.title);
    }
    
    if (this.data.document?.dossier?.name) {
      breadcrumb.push(this.data.document.dossier.name);
    }
    
    return breadcrumb;
  }

  hasMetadata(): boolean {
    return this.getMetadata().length > 0;
  }

  getMetadata(): Array<{key: string, value: string}> {
    const metadata: Array<{key: string, value: string}> = [];
    
    if (this.data.document?.metadata) {
      Object.entries(this.data.document.metadata).forEach(([key, value]) => {
        metadata.push({ key, value: String(value) });
      });
    }
    
    return metadata;
  }

  // Utility methods
  canCopyLink(): boolean {
    return navigator.clipboard && window.location.protocol === 'https:';
  }

  async copyLink(): Promise<void> {
    if (!this.canCopyLink()) return;
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log('Lien copié dans le presse-papiers');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }
 getDocumentStats(): boolean {
    return this.getPageCount() > 0 || this.getWordCount() > 0;
  }

  getPageCount(): number {
    // For PDF, you might need to implement PDF page counting
    if (this.isPdf()) {
      return this.data.document?.pageCount || 0;
    }
    return 0;
  }

  getWordCount(): number {
    if (this.isText()) {
      const content = this.getTextContent();
      return content.split(/\s+/).filter(word => word.length > 0).length;
    }
    return 0;
  }

  deleteDocument(): void {
    console.log('Delete document:', this.data.document?.id);
    this.dialogRef.close({ action: 'delete', document: this.data.document });
  }

  onDocumentLoaded(): void {
    setTimeout(() => {
      this.loading = false;
      this.error = null;
    }, 100);
  }
  
  getImageDataUrl(): string {
    if (!this.data.document?.content) return '';
    return `data:${this.data.type || 'image/jpeg'};base64,${this.data.document.content}`;
  }
}