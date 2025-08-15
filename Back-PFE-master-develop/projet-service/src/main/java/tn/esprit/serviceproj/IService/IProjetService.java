package tn.esprit.serviceproj.IService;

import org.springframework.security.core.userdetails.User;
import org.springframework.web.client.RestTemplate;
import tn.esprit.serviceproj.Entity.Projet;
import tn.esprit.serviceproj.Entity.TeamDto;
import tn.esprit.serviceproj.Repository.ProjetRepo;

import java.util.List;
import java.util.Map;

public interface IProjetService {
    List<Map<String, Object>> getUsersForProject(Long projectId);

    Projet createProjet(Projet projet);

    Projet getProjetById(Long id);

    List<Projet> getAllProjets();

    List<Projet> getArchivedProjets();

    List<Projet> getActiveProjets();

    List<Projet> getArchivedProjetsByUser(Long userId);

    List<Projet> getActiveProjetsByUser(Long userId);

    void deleteProjet(Long id);

    Projet updateProjet(Long id, Projet projetDetails);

    Projet archiveProjet(Long id, Long userId);

    Projet restoreProjet(Long id, Long userId);

    Projet affecterUtilisateurs(Long projetId, List<Long> userIds);

    TeamDto getTeamById(Long teamId);

    Projet assignTeamToProject(Long projetId, Long teamId);

    TeamDto getTeamByIdWithMembers(Long teamId);


    // Méthode pour récupérer les utilisateurs associés au projet

}
