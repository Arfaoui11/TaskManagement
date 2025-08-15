package tn.esprit.serviceproj.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.serviceproj.Entity.Projet;

import java.util.List;

public interface ProjetRepo extends JpaRepository<Projet, Long> {


    List<Projet> findByArchivedTrueAndAndCreatedBy(Long userId);

    // Change from findByArchivedFalseAndUserId to findByArchivedFalseAndUserIdsContaining
    List<Projet> findByArchivedFalseAndUserIdsContaining(Long userId);

    // Keep these as they are
    List<Projet> findByArchivedTrue();
    List<Projet> findByArchivedFalse();
}
