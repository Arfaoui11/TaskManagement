package tn.esprit.serviceproj.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.serviceproj.Entity.Tache;
import tn.esprit.serviceproj.IService.ITacheService;
import tn.esprit.serviceproj.Repository.TacheRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TacheService implements ITacheService {

    private final TacheRepo tacheRepository;

    @Override
    public Tache ajouterTache(Tache tache) {
        tache.setCreatedAt(LocalDateTime.now());
        return tacheRepository.save(tache);
    }

    @Override
    public List<Tache> getAllTaches() {
        return tacheRepository.findAll();
    }

    @Override
    public Tache getTacheById(Long id) {
        return tacheRepository.findById(id).orElse(null);
    }

    @Override
    public Tache updateTache(Long id, Tache updatedTache) {
        Optional<Tache> optionalTache = tacheRepository.findById(id);
        if (optionalTache.isPresent()) {
            Tache existing = optionalTache.get();
            existing.setTitre(updatedTache.getTitre());
            existing.setDescription(updatedTache.getDescription());
            existing.setCommentaires(updatedTache.getCommentaires());
            existing.setDateDebut(updatedTache.getDateDebut());
            existing.setDateFin(updatedTache.getDateFin());
            existing.setStatut(updatedTache.getStatut());
            existing.setPriorite(updatedTache.getPriorite());
            existing.setTempsEstime(updatedTache.getTempsEstime());
            existing.setTempsPasse(updatedTache.getTempsPasse());
            existing.setCategorie(updatedTache.getCategorie());
            existing.setUpdatedAt(LocalDateTime.now());
            existing.setResponsable(updatedTache.getResponsable());
            existing.setProjet(updatedTache.getProjet());
            return tacheRepository.save(existing);
        }
        return null;
    }
    @Override
    public Tache updateDatesTache(Long id, LocalDateTime dateDebut, LocalDateTime dateFin, Tache tache) {
        Optional<Tache> optionalTache = tacheRepository.findById(id);
        if (optionalTache.isPresent()) {
            Tache existing = optionalTache.get();
            existing.setDateDebut(tache.getDateDebut());
            existing.setDateFin(tache.getDateFin());
            existing.setUpdatedAt(LocalDateTime.now());
            return tacheRepository.save(existing);
        }
        return null;
    }
    @Override
    public void deleteTache(Long id) {
        tacheRepository.deleteById(id);
    }
    @Override
    public List<Tache> getTachesByProjetId(Long projetId) {
        return tacheRepository.findByProjetId(projetId);
    }
}
