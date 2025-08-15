package tn.esprit.serviceproj.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.serviceproj.Entity.Dossier;
import tn.esprit.serviceproj.Entity.Projet;
import tn.esprit.serviceproj.Repository.DossierRepo;
import tn.esprit.serviceproj.Repository.ProjetRepo;

import java.util.List;
import java.util.Optional;

@Service
public class DossierService {

    private static final Logger logger = LoggerFactory.getLogger(DossierService.class);

    @Autowired
    private DossierRepo dossierRepository;

    @Autowired
    private ProjetRepo projetRepository;

    // Méthode pour obtenir tous les dossiers
    public List<Dossier> getAllDossiers() {
        logger.info("getAllDossiers called");
        return dossierRepository.findAll();
    }

    // Méthode pour obtenir les dossiers actifs d'un utilisateur
    public List<Dossier> getActiveDossiers(Long userId) {
        logger.info("getActiveDossiers called for userId: {}", userId);
        return dossierRepository.findByArchivedFalseAndUserId(userId);
    }

    // Méthode pour obtenir les dossiers archivés d'un utilisateur
    public List<Dossier> getArchivedDossiers(Long userId) {
        logger.info("getArchivedDossiers called for userId: {}", userId);
        return dossierRepository.findByArchivedTrueAndUserId(userId);
    }

    // Méthode pour obtenir un dossier par son ID
    public Optional<Dossier> getDossierById(Long id) {
        logger.info("getDossierById called with id: {}", id);
        return dossierRepository.findById(id);
    }

    // Méthode pour enregistrer un dossier
    public Dossier saveDossier(Dossier dossier, Long projetId, Long parentId) {
        // Associer le dossier à un projet si un projetId est fourni
        if (projetId != null) {
            Projet projet = projetRepository.findById(projetId)
                    .orElseThrow(() -> new RuntimeException("Projet not found"));
            dossier.setProjet(projet);
        }

        // Gérer le cas spécial où parentId est 0 (dossier racine)
        // Si parentId est 0, le traiter comme null pour respecter la contrainte de clé étrangère
        if (parentId != null && parentId == 0) {
            parentId = null;
        }

        // Définir le parentId (peut être null pour un dossier racine)
        dossier.setParentId(parentId);

        // Sauvegarder et retourner le dossier
        return dossierRepository.save(dossier);
    }

    // Méthode pour mettre à jour un dossier
    public Dossier updateDossier(Long id, Dossier dossierDetails) {
        logger.info("updateDossier called with id: {}", id);
        Optional<Dossier> existingDossier = dossierRepository.findById(id);
        if (existingDossier.isPresent()) {
            Dossier dossier = existingDossier.get();
            dossier.setName(dossierDetails.getName());
            dossier.setProjet(dossierDetails.getProjet());
            logger.info("Dossier mis à jour: {}", dossier.getName());
            return dossierRepository.save(dossier);
        }
        logger.warn("Dossier avec id: {} non trouvé pour mise à jour", id);
        return null;
    }

    // Méthode pour supprimer un dossier
    public boolean deleteDossier(Long id) {
        logger.info("deleteDossier called with id: {}", id);
        Optional<Dossier> dossier = dossierRepository.findById(id);
        if (dossier.isPresent()) {
            dossierRepository.delete(dossier.get());
            logger.info("Dossier avec id: {} supprimé", id);
            return true;
        }
        logger.warn("Dossier avec id: {} non trouvé pour suppression", id);
        return false;
    }

    // Méthode pour archiver un dossier
    public Dossier archiveDossier(Long id) {
        logger.info("archiveDossier called with id: {}", id);
        Optional<Dossier> dossierOptional = dossierRepository.findById(id);
        if (dossierOptional.isPresent()) {
            Dossier dossier = dossierOptional.get();
            dossier.setArchived(true);
            logger.info("Dossier avec id: {} archivé", id);
            return dossierRepository.save(dossier);
        }
        logger.warn("Dossier avec id: {} non trouvé pour l'archivage", id);
        return null;
    }

    // Méthode pour restaurer un dossier
    public Dossier restoreDossier(Long id) {
        logger.info("restoreDossier called with id: {}", id);
        Optional<Dossier> dossierOptional = dossierRepository.findById(id);
        if (dossierOptional.isPresent()) {
            Dossier dossier = dossierOptional.get();
            dossier.setArchived(false);
            logger.info("Dossier avec id: {} restauré", id);
            return dossierRepository.save(dossier);
        }
        logger.warn("Dossier avec id: {} non trouvé pour la restauration", id);
        return null;
    }

    // Méthode pour obtenir les dossiers par projet
    public List<Dossier> getDossiersByProjet(Long projetId) {
        logger.info("getDossiersByProjet called with projetId: {}", projetId);
        return dossierRepository.findByProjetId(projetId);
    }

    // Méthode pour obtenir les dossiers actifs par projet
    public List<Dossier> getActiveDossiersByProjet(Long projetId) {
        logger.info("getActiveDossiersByProjet called with projetId: {}", projetId);
        return dossierRepository.findByProjetIdAndArchivedFalse(projetId);
    }

    // Méthode pour obtenir les dossiers archivés par projet
    public List<Dossier> getArchivedDossiersByProjet(Long projetId) {
        logger.info("getArchivedDossiersByProjet called with projetId: {}", projetId);
        return dossierRepository.findByProjetIdAndArchivedTrue(projetId);
    }

    // Méthode pour obtenir les dossiers racines
    public List<Dossier> getRootDossiers(Long projetId) {
        return dossierRepository.findByProjetIdAndParentIdIsNull(projetId);
    }

    // Méthode pour obtenir les sous-dossiers
    public List<Dossier> getSubDossiers(Long projetId, Long parentId) {
        logger.info("getSubDossiers called with projetId: {} and parentId: {}", projetId, parentId);
        List<Dossier> subDossiers = dossierRepository.findByProjetIdAndParentId(projetId, parentId);
        logger.info("Nombre de sous-dossiers trouvés pour le projet {} et parentId {}: {}", projetId, parentId, subDossiers.size());
        return subDossiers;
    }
}
