package tn.esprit.serviceproj.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.serviceproj.Entity.Projet;
import tn.esprit.serviceproj.Service.ProjetService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projets")
@RequiredArgsConstructor
public class ProjetController {

    private final ProjetService projetService;

    @PostMapping
    public ResponseEntity<Projet> createProjet(@RequestBody Projet projet) {
        Projet createdProjet = projetService.createProjet(projet);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProjet);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projet> getProjetById(@PathVariable Long id) {
        Projet projet = projetService.getProjetById(id);
        return ResponseEntity.ok(projet);
    }

    @GetMapping
    public ResponseEntity<List<Projet>> getAllProjets() {
        List<Projet> projets = projetService.getAllProjets();
        return ResponseEntity.ok(projets);
    }

    @GetMapping("/archived")
    public ResponseEntity<List<Projet>> getArchivedProjets() {
        List<Projet> archivedProjets = projetService.getArchivedProjets();
        return ResponseEntity.ok(archivedProjets);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Projet>> getActiveProjets() {
        List<Projet> activeProjets = projetService.getActiveProjets();
        return ResponseEntity.ok(activeProjets);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long id) {
        projetService.deleteProjet(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Projet> updateProjet(@PathVariable Long id, @RequestBody Projet projetDetails) {
        Projet updatedProjet = projetService.updateProjet(id, projetDetails);
        return ResponseEntity.ok(updatedProjet);
    }


    @GetMapping("/{projectId}/users")
    public ResponseEntity<List<Map<String, Object>>> getUsersForProjet(@PathVariable Long projectId) {
        List<Map<String, Object>> users = projetService.getUsersForProject(projectId);
        return ResponseEntity.ok(users);
    }
    @GetMapping("/archived/user/{userId}")
    public ResponseEntity<List<Projet>> getArchivedProjetsByUser(@PathVariable Long userId) {
        List<Projet> projets = projetService.getArchivedProjetsByUser(userId);
        return ResponseEntity.ok(projets);
    }

    @GetMapping("/active/user/{userId}")
    public ResponseEntity<List<Projet>> getActiveProjetsByUser(@PathVariable Long userId) {
        List<Projet> projets = projetService.getActiveProjetsByUser(userId);
        return ResponseEntity.ok(projets);
    }

    @PatchMapping("/{id}/archive/{userId}")
    public ResponseEntity<Projet> archiveProjet(@PathVariable Long id, @PathVariable Long userId) {
        Projet projet = projetService.archiveProjet(id, userId);
        return ResponseEntity.ok(projet);
    }

    @PatchMapping("/{id}/restore/{userId}")
    public ResponseEntity<Projet> restoreProjet(@PathVariable Long id, @PathVariable Long userId) {
        Projet projet = projetService.restoreProjet(id, userId);
        return ResponseEntity.ok(projet);
    }
    @PostMapping("/{id}/affecter")
    public ResponseEntity<Projet> affecterUtilisateurs(
            @PathVariable Long id,
            @RequestBody List<Long> userIds) {
        try {
            // Récupérer le projet par ID
            Projet projet = projetService.getProjetById(id);

            // Vérifier si les utilisateurs sont déjà affectés au projet
            for (Long userId : userIds) {
                if (projet.getUserIds().contains(userId)) {
                    // Si l'utilisateur est déjà affecté, ignorer et informer
                    return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
                }
            }

            // Affecter les utilisateurs (ajouter les utilisateurs non encore affectés)
            projet = projetService.affecterUtilisateurs(id, userIds);
            return new ResponseEntity<>(projet, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    @PutMapping("/{projetId}/assign-team/{teamId}")
    public ResponseEntity<Projet> assignTeamToProject(@PathVariable Long projetId, @PathVariable Long teamId) {
        return ResponseEntity.ok(projetService.assignTeamToProject(projetId, teamId));
    }

}
