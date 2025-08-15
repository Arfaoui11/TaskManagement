package tn.esprit.serviceproj.IService;

import tn.esprit.serviceproj.Entity.Tache;

import java.time.LocalDateTime;
import java.util.List;

public interface ITacheService {
    Tache ajouterTache(Tache tache);

    List<Tache> getAllTaches();

    Tache getTacheById(Long id);

    Tache updateTache(Long id, Tache updatedTache);


    Tache updateDatesTache(Long id, LocalDateTime dateDebut, LocalDateTime dateFin, Tache tache);

    void deleteTache(Long id);

    List<Tache> getTachesByProjetId(Long projetId);
}
