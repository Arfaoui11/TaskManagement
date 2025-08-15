package tn.esprit.serviceproj.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.serviceproj.Entity.Document;
import tn.esprit.serviceproj.Entity.Dossier;
import tn.esprit.serviceproj.Entity.Projet;

import javax.transaction.Transactional;
import java.util.List;

public interface DocumentRepo extends JpaRepository<Document, Long> {

    List<Document> findByArchivedFalseAndUserId(Long userId);

    List<Document> findByArchivedTrueAndUserId(Long userId);

    List<Document> findByDossierId(Long dossierId);

    List<Document> findByDossierIdAndArchivedTrue(Long dossierId);

    List<Document> findByDossierIdAndArchivedFalse(Long dossierId);

    List<Document> findByDossierProjetId(Long projetId);

    List<Document> findByDossierProjetIdAndArchivedFalse(Long projectId);

    List<Document> findByUserIdAndArchivedFalse(Long userId);

    List<Document> findByUserIdAndArchivedTrue(Long userId);

    List<Document> findByDossierIn(List<Dossier> dossiers);

    List<Document> findByParentId(Long parentId);

    List<Document> findByDossierInAndArchivedFalse(List<Dossier> dossiers);

    List<Document> findByProjetIsNullAndDossierIsNullAndArchivedFalse();

    List<Document> findByProjetAndParentId(Projet projet, long l);

}
