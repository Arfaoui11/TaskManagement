package tn.esprit.serviceproj.Controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.serviceproj.Entity.Document;
import tn.esprit.serviceproj.Entity.Projet;
import tn.esprit.serviceproj.IService.IDocumentService;
import tn.esprit.serviceproj.IService.IProjetService;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final IDocumentService documentService;
    private final IProjetService projetService;

    public DocumentController(IDocumentService documentService, IProjetService projetService) {
        this.documentService = documentService;
        this.projetService = projetService;
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "dossierId", required = false) Long dossierId,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "parentId", required = false) Long parentId,
            @RequestParam(value = "projetId", required = false) Long projetId
    ) {
        try {
            // Validation des paramètres
            if (dossierId == null && projetId == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Erreur : dossierId ou projetId doit être spécifié.");
            }

            // Appeler le service pour uploader le document
            Document doc = documentService.uploadDocument(name, file, dossierId, userId, parentId, projetId);

            if (doc == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Échec de l'enregistrement du document : Dossier ou Projet introuvable.");
            }

            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la lecture du fichier : " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur inattendue : " + e.getMessage());
        }
    }





    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Resource resource = documentService.downloadFile(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/documents/{id}/preview")
    public ResponseEntity<String> getDocumentPreview(@PathVariable Long id) {
        return documentService.getDocumentPreview(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Document> archiveDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.archiveDocument(id));
    }
    @GetMapping("{projectId}/root")
    public ResponseEntity<List<Document>> getRootDocuments(@PathVariable Long projectId) {
        System.out.println("=== DEBUG getRootDocuments ===");
        System.out.println("ProjectId reçu: " + projectId);

        try {
            // 1. Vérifier si le projet existe
            Projet projet = projetService.getProjetById(projectId);
            System.out.println("Projet trouvé: " + (projet != null ? projet.getId() + " - " + projet.getTitle() : "NULL"));

            if (projet == null) {
                System.out.println("ERREUR: Projet non trouvé");
                return ResponseEntity.notFound().build();
            }

            // 2. Appeler le service pour récupérer les documents racine
            List<Document> rootDocuments = documentService.getRootDocumentsByProject(projet);
            System.out.println("Documents racine trouvés: " + rootDocuments.size());

            // 3. Debug des documents trouvés
            for (Document doc : rootDocuments) {
                System.out.println("- Doc ID: " + doc.getId() +
                        ", Name: " + doc.getName() +
                        ", ParentId: " + doc.getParentId() +
                        ", ProjetId: " + (doc.getProjet() != null ? doc.getProjet().getId() : "null"));
            }

            return ResponseEntity.ok(rootDocuments);

        } catch (Exception e) {
            System.err.println("ERREUR dans getRootDocuments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }

    }


    @PatchMapping("/{id}/restore")
    public ResponseEntity<Document> restoreDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.restoreDocument(id));
    }

    @GetMapping("/dossiers/{dossierId}")
    public ResponseEntity<List<Document>> getDocumentsByDossier(@PathVariable Long dossierId) {
        return ResponseEntity.ok(documentService.getDocumentsByDossier(dossierId));
    }

    @GetMapping("/projets/{projectId}")
    public ResponseEntity<List<Document>> getDocumentsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(documentService.getDocumentsByProject(projectId));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "dossierId", required = false) Long dossierId
    ) throws IOException {
        Document updated = documentService.updateDocument(id, name, content, file, dossierId);
        return ResponseEntity.ok(updated);
    }






    // Endpoints pour les documents actifs et archivés par utilisateur
    @GetMapping("/active/{userId}")
    public ResponseEntity<List<Document>> getActiveDocumentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getActiveDocumentsByUser(userId));
    }

    @GetMapping("/archived/{userId}")
    public ResponseEntity<List<Document>> getArchivedDocumentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getArchivedDocumentsByUser(userId));
    }

    @GetMapping("/dossiers/{dossierId}/active")
    public ResponseEntity<List<Document>> getActiveDocumentsByDossier(@PathVariable Long dossierId) {
        return ResponseEntity.ok(documentService.getActiveDocumentsByDossier(dossierId));
    }

    @GetMapping("/dossiers/{dossierId}/archived")
    public ResponseEntity<List<Document>> getArchivedDocumentsByDossier(@PathVariable Long dossierId) {
        return ResponseEntity.ok(documentService.getArchivedDocumentsByDossier(dossierId));
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Document>> getDocumentsByParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(documentService.getDocumentsByParent(parentId));
    }

    @GetMapping("/projets/{projectId}/active")
    public ResponseEntity<List<Document>> getActiveDocumentsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(documentService.getActiveDocumentsByProject(projectId));
    }

    // Ajout d'un endpoint de suppression
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}