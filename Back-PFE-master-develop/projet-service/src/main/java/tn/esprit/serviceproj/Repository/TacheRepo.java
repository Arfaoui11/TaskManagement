package tn.esprit.serviceproj.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.serviceproj.Entity.Dossier;
import tn.esprit.serviceproj.Entity.Tache;

import java.util.List;

public interface TacheRepo  extends JpaRepository<Tache, Long> {
    List<Tache> findByProjetId(Long projetId);
}
