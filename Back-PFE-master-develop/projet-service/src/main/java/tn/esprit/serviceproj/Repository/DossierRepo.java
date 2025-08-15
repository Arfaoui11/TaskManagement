package tn.esprit.serviceproj.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.serviceproj.Entity.Dossier;

import java.util.List;

public interface DossierRepo extends JpaRepository<Dossier, Long> {

    List<Dossier> findByArchivedFalseAndUserId(Long userId);

    List<Dossier> findByArchivedTrueAndUserId(Long userId);

    List<Dossier> findByProjetId(Long projetId);

    List<Dossier> findByProjetIdAndArchivedFalse(Long projetId);

    List<Dossier> findByProjetIdAndArchivedTrue(Long projetId);


    List<Dossier> findByProjetIdAndParentId(Long projetId, Long parentId);

    List<Dossier> findByProjetIdAndParentIdIsNull(Long projetId);
}