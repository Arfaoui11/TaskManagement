package tn.esprit.serviceproj.IService;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.serviceproj.Entity.Document;
import tn.esprit.serviceproj.Entity.Projet;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IDocumentService {

    List<Document> getAllDocuments();

    Document getDocumentById(Long id);


    Document restoreDocument(Long id);

    List<Document> getDocumentsByDossier(Long dossierId);


    List<Document> getRootDocumentsByProject(Projet project);



    Document updateDocument(Long documentId, String name, String content, MultipartFile file, Long dossierId) throws IOException;

    List<Document> getDocumentsByProject(Long projectId);

    List<Document> getActiveDocumentsByUser(Long userId);

    List<Document> getArchivedDocumentsByUser(Long userId);

    List<Document> getActiveDocumentsByDossier(Long dossierId);

    List<Document> getArchivedDocumentsByDossier(Long dossierId);

    List<Document> getDocumentsByParent(Long parentId);

    List<Document> getActiveDocumentsByProject(Long projectId);

    void deleteDocument(Long id);


    Document uploadDocument(String name, MultipartFile file, Long dossierId, Long userId, Long parentId, Long projetId) throws IOException;


    Resource downloadFile(Long id);




    Optional<String> getDocumentPreview(Long id);

    Document archiveDocument(Long id);

}
