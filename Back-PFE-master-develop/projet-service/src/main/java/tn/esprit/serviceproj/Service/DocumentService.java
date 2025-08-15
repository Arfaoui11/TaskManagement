package tn.esprit.serviceproj.Service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.serviceproj.Entity.Document;
import tn.esprit.serviceproj.Entity.Dossier;
import tn.esprit.serviceproj.Entity.Projet;
import tn.esprit.serviceproj.IService.IDocumentService;
import tn.esprit.serviceproj.Repository.DocumentRepo;
import tn.esprit.serviceproj.Repository.DossierRepo;
import tn.esprit.serviceproj.Repository.ProjetRepo;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService implements IDocumentService {
    private final DocumentRepo documentRepository;
    private final DossierRepo dossierRepository;
    private final ProjetRepo projetRepository;

    public DocumentService(DocumentRepo documentRepository, DossierRepo dossierRepository, ProjetRepo projetRepository) {
        this.documentRepository = documentRepository;
        this.dossierRepository = dossierRepository;
        this.projetRepository = projetRepository;
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }


    @Override
    public Document uploadDocument(String name, MultipartFile file, Long dossierId, Long userId, Long parentId, Long projetId) throws IOException {
        if (userId == null || (dossierId == null && projetId == null)) {
            throw new IllegalArgumentException("Paramètres invalides : userId ou dossierId/projetId manquant.");
        }

        // Log pour suivre l'entrée des paramètres
        System.out.println(">>> Paramètres reçus - userId: " + userId + ", dossierId: " + dossierId + ", projetId: " + projetId);
        System.out.println(">>> Fichier reçu : " + file.getOriginalFilename());

        // Initialiser le document
        Document doc = new Document();
        doc.setName(name);

        // Vérifier si le fichier est vide
        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide !");
        }

        // Truncate the file name if it's too long for the DB column
        String fileName = Paths.get(file.getOriginalFilename()).getFileName().toString();
//        if (fileName != null && fileName.length() > 255) {
//            fileName = fileName.substring(0, 255);  // Truncate to fit the DB column size
//        }

        doc.setFileName(fileName);
        doc.setFileSize(file.getSize());
        doc.setType(file.getContentType());
        doc.setUserId(userId);

        // Au lieu de stocker le contenu en base64 directement dans la table,
        // enregistrer le fichier sur le système de fichiers et stocker l'URL
        // OU utiliser un champ de type BLOB/TEXT dans la base de données

        // Option 1: Stocker le fichier physiquement et sauvegarder l'URL
        String fileStoragePath = "uploads/"; // Définir un chemin de stockage approprié
        String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
        String filePath = fileStoragePath + uniqueFileName;

        // Créer le répertoire si nécessaire
        File directory = new File(fileStoragePath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Enregistrer le fichier physiquement
        Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

        // Stocker l'URL du fichier au lieu du contenu
        doc.setUrl(filePath);
        // Ne pas stocker le contenu en base64 dans la DB
        // doc.setContent(null);

        // Option 2 (alternative): Si vous devez absolument stocker en base64 dans la DB
        // Assurez-vous que la colonne content est de type TEXT ou BLOB et non VARCHAR(255)
        String base64Content = Base64.getEncoder().encodeToString(file.getBytes());
        doc.setContent(base64Content);

        // Récupérer le dossier ou projet
        if (dossierId != null) {
            Optional<Dossier> dossier = dossierRepository.findById(dossierId);
            if (dossier.isPresent()) doc.setDossier(dossier.get());
        } else if (projetId != null) {
            Projet projet = projetRepository.findById(projetId).orElseThrow(() ->
                    new IllegalArgumentException("Projet introuvable avec l'ID : " + projetId));
            System.out.println(">>> Projet trouvé : " + projet.getTitle());
            doc.setProjet(projet);
        }

        // Sauvegarde du document
        System.out.println(">>> Sauvegarde du document...");
        return documentRepository.save(doc);
    }


    @Override
    public Resource downloadFile(Long id) {
        Document document = getDocumentById(id);
        try {
            byte[] data = Files.readAllBytes(Paths.get(document.getUrl()));
            return new ByteArrayResource(data);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier.", e);
        }
    }

    @Override
    public Optional<String> getDocumentPreview(Long id) {
        Document document = getDocumentById(id);
        try {
            byte[] fileData = Files.readAllBytes(Paths.get(document.getUrl()));
            String base64 = Base64.getEncoder().encodeToString(fileData);
            return Optional.of(base64);
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    @Override
    public Document archiveDocument(Long id) {
        Document doc = getDocumentById(id);
        doc.setArchived(true);
        return documentRepository.save(doc);
    }

    @Override
    public Document restoreDocument(Long id) {
        Document doc = getDocumentById(id);
        doc.setArchived(false);
        return documentRepository.save(doc);
    }

    @Override
    public List<Document> getDocumentsByDossier(Long dossierId) {
        return documentRepository.findByDossierId(dossierId);
    }

    @Override
    public Document updateDocument(Long documentId, String name, String content, MultipartFile file, Long dossierId) throws IOException {
        Document existingDocument = getDocumentById(documentId);

        // Mise à jour du nom
        if (name != null && !name.isEmpty()) {
            existingDocument.setName(name);
        }

        // Mise à jour du contenu
        if (content != null) {
            existingDocument.setContent(content);
        }

        // Si un nouveau fichier est fourni
        if (file != null && !file.isEmpty()) {
            // Supprimer l'ancien fichier du système (optionnel)
            if (existingDocument.getUrl() != null) {
                File oldFile = new File(existingDocument.getUrl());
                if (oldFile.exists()) oldFile.delete();
            }

            // Enregistrer le nouveau fichier
            String fileStoragePath = "uploads/";
            String uniqueFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = fileStoragePath + uniqueFileName;

            File directory = new File(fileStoragePath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

            // Mise à jour des infos du document
            existingDocument.setFileName(file.getOriginalFilename());
            existingDocument.setFileSize(file.getSize());
            existingDocument.setType(file.getContentType());
            existingDocument.setUrl(filePath);
            existingDocument.setContent(Base64.getEncoder().encodeToString(file.getBytes()));
        }

        // Mettre à jour le dossier si nécessaire
        if (dossierId != null) {
            Dossier dossier = dossierRepository.findById(dossierId)
                    .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
            existingDocument.setDossier(dossier);
        }

        return documentRepository.save(existingDocument);
    }


    @Override
    public List<Document> getDocumentsByProject(Long projectId) {
        return documentRepository.findByDossierProjetId(projectId);
    }

    @Override
    public List<Document> getActiveDocumentsByUser(Long userId) {
        return documentRepository.findByUserIdAndArchivedFalse(userId);
    }

    @Override
    public List<Document> getArchivedDocumentsByUser(Long userId) {
        return documentRepository.findByUserIdAndArchivedTrue(userId);
    }

    @Override
    public List<Document> getActiveDocumentsByDossier(Long dossierId) {
        return documentRepository.findByDossierIdAndArchivedFalse(dossierId);
    }

    @Override
    public List<Document> getArchivedDocumentsByDossier(Long dossierId) {
        return documentRepository.findByDossierIdAndArchivedTrue(dossierId);
    }

    @Override
    public List<Document> getDocumentsByParent(Long parentId) {
        return documentRepository.findByParentId(parentId);
    }

    @Override
    public List<Document> getActiveDocumentsByProject(Long projectId) {
        return documentRepository.findByDossierProjetIdAndArchivedFalse(projectId);
    }

    @Override
    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    @Override
    public List<Document> getRootDocumentsByProject(Projet projet) {
        return documentRepository.findByProjetAndParentId(projet, 0L);
    }

}