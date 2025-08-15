package tn.esprit.userservice.IService;

import org.springframework.transaction.annotation.Transactional;
import tn.esprit.userservice.Entity.Team;
import tn.esprit.userservice.Entity.User;

import java.util.List;
import java.util.Optional;

public interface ITeamService {

    Team createTeam(Team team);

    // Ajouter un utilisateur à une équipe
    @Transactional
    // Dans ton service TeamService
    Optional<Team> addUserToTeam(Long teamId, Long userId);

    // Retirer un utilisateur d'une équipe
    @Transactional
    Team removeUserFromTeam(Long teamId, Long userId);

    // Récupérer une équipe par ID avec ses utilisateurs associés
    Optional<Team> getTeamById(Long teamId);

    List<Team> getAllTeams();

    @Transactional
    Team updateTeam(Long teamId, Team teamDetails);

    @Transactional
    void deleteTeam(Long teamId);

    @Transactional
    Team addUsersToTeam(Long teamId, List<Long> userIds);

    List<User> getUsersByTeamId(Long teamId);
}
