package tn.esprit.serviceproj.IService;

import tn.esprit.serviceproj.Entity.Dossier;

import java.util.List;
import java.util.Optional;

public interface IDossierService {
    List<Dossier> getAllDossiers();


    List<Dossier> getActiveDossiers(Long userId);

    List<Dossier> getArchivedDossiers(Long userId);

    Optional<Dossier> getDossierById(Long id);

    Dossier createDossier(Dossier dossier);

    Dossier updateDossier(Long id, Dossier dossierDetails);

    boolean deleteDossier(Long id);

    Dossier archiveDossier(Long id);

    Dossier restoreDossier(Long id);

    List<Dossier> getDossiersByProjet(Long projetId);

    List<Dossier> getActiveDossiersByProjet(Long projetId);

    List<Dossier> getArchivedDossiersByProjet(Long projetId);
}
