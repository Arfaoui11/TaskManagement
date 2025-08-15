package tn.esprit.serviceproj.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.serviceproj.Entity.Dossier;
import tn.esprit.serviceproj.Service.DossierService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/dossiers")
public class DossierController {

    @Autowired
    private DossierService dossierService;

    @GetMapping("/active/{userId}")
    public ResponseEntity<List<Dossier>> getActiveDossiers(@PathVariable Long userId) {
        return ResponseEntity.ok(dossierService.getActiveDossiers(userId));
    }

    @GetMapping("/archived/{userId}")
    public ResponseEntity<List<Dossier>> getArchivedDossiers(@PathVariable Long userId) {
        return ResponseEntity.ok(dossierService.getArchivedDossiers(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dossier> getDossierById(@PathVariable Long id) {
        Optional<Dossier> dossier = dossierService.getDossierById(id);
        if (dossier.isPresent()) {
            return ResponseEntity.ok(dossier.get());
        } else {
            return ResponseEntity.status(404).body(null); // Renvoie un 404 si le dossier n'est pas trouvé
        }
    }

    @PostMapping
    public Dossier createDossier(@RequestBody Dossier dossier,
                                 @RequestParam(required = false) Long projetId,
                                 @RequestParam(required = false) Long parentId) {
        return dossierService.saveDossier(dossier, projetId, parentId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dossier> updateDossier(@PathVariable Long id, @RequestBody Dossier dossierDetails) {
        Dossier updatedDossier = dossierService.updateDossier(id, dossierDetails);
        if (updatedDossier != null) {
            return ResponseEntity.ok(updatedDossier);
        } else {
            return ResponseEntity.status(404).body(null); // Renvoie un 404 si le dossier n'existe pas
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDossier(@PathVariable Long id) {
        boolean deleted = dossierService.deleteDossier(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(404).build(); // Renvoie un 404 si le dossier n'existe pas
        }
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Dossier> archiveDossier(@PathVariable Long id) {
        Dossier archivedDossier = dossierService.archiveDossier(id);
        if (archivedDossier != null) {
            return ResponseEntity.ok(archivedDossier);
        } else {
            return ResponseEntity.status(404).body(null); // Renvoie un 404 si le dossier n'est pas trouvé
        }
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Dossier> restoreDossier(@PathVariable Long id) {
        Dossier restoredDossier = dossierService.restoreDossier(id);
        if (restoredDossier != null) {
            return ResponseEntity.ok(restoredDossier);
        } else {
            return ResponseEntity.status(404).body(null); // Renvoie un 404 si le dossier n'est pas trouvé
        }
    }

    @GetMapping("/projets/{projetId}/root")
    public ResponseEntity<List<Dossier>> getRootDossiers(@PathVariable Long projetId) {
        return ResponseEntity.ok(dossierService.getRootDossiers(projetId));
    }

    @GetMapping("/projets/{projetId}/parent/{parentId}")
    public ResponseEntity<List<Dossier>> getSubDossiers(@PathVariable Long projetId, @PathVariable Long parentId) {
        return ResponseEntity.ok(dossierService.getSubDossiers(projetId, parentId));
    }

    @GetMapping("/projets/{projetId}")
    public ResponseEntity<List<Dossier>> getDossiersByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(dossierService.getDossiersByProjet(projetId));
    }

    @GetMapping("/projets/{projetId}/active")
    public ResponseEntity<List<Dossier>> getActiveDossiersByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(dossierService.getActiveDossiersByProjet(projetId));
    }

    @GetMapping("/projets/{projetId}/archived")
    public ResponseEntity<List<Dossier>> getArchivedDossiersByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(dossierService.getArchivedDossiersByProjet(projetId));
    }
}
