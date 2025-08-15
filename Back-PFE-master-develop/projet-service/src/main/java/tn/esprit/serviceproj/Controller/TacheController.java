package tn.esprit.serviceproj.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.serviceproj.Entity.Tache;
import tn.esprit.serviceproj.Service.TacheService;

import java.time.LocalDateTime;
import java.util.List;
@RestController
@RequestMapping("/taches")
@RequiredArgsConstructor
public class TacheController {
    private final TacheService tacheService;

    @PostMapping
    public ResponseEntity<Tache> ajouterTache(@RequestBody Tache tache) {
        return ResponseEntity.ok(tacheService.ajouterTache(tache));
    }

    @GetMapping
    public ResponseEntity<List<Tache>> getAllTaches() {
        return ResponseEntity.ok(tacheService.getAllTaches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tache> getTacheById(@PathVariable Long id) {
        Tache tache = tacheService.getTacheById(id);
        return tache != null ? ResponseEntity.ok(tache) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tache> updateTache(@PathVariable Long id, @RequestBody Tache tache) {
        Tache updated = tacheService.updateTache(id, tache);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
    @PutMapping("/{id}/dates")
    public ResponseEntity<Tache> updateTacheDates(@PathVariable Long id,
                                                  @RequestParam("dateDebut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
                                                  @RequestParam("dateFin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin, @RequestBody Tache tache) {
        Tache updated = tacheService.updateDatesTache(id, dateDebut, dateFin,tache);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        tacheService.deleteTache(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/projets/{projetId}")
    public List<Tache> getTachesByProjetId(@PathVariable Long projetId) {
        return tacheService.getTachesByProjetId(projetId);
    }
}
