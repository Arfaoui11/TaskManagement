package tn.esprit.userservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.userservice.Entity.Team;
import tn.esprit.userservice.Entity.User;
import tn.esprit.userservice.IService.ITeamService;
import tn.esprit.userservice.Repository.TeamRepo;
import tn.esprit.userservice.Repository.UserRepo;

import java.util.*;

@Service
public class TeamService implements ITeamService {

    @Autowired
    private TeamRepo teamRepo;

    @Autowired
    private UserRepo userRepo;
    @Override
    @Transactional
    public Team createTeam(Team team) {
        // Vérifier si le nom de l'équipe est unique ou valide
        if (team.getName() == null || team.getName().trim().isEmpty()) {
            throw new RuntimeException("Le nom de l'équipe est obligatoire");
        }

        Set<User> validUsers = new HashSet<>();

        // Gérer le cas où les utilisateurs sont passés comme des objets incomplets
        for (User user : team.getUsers()) {
            if (user.getId() == null) {
                throw new RuntimeException("ID utilisateur invalide");
            }

            User userEntity = userRepo.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + user.getId()));

            validUsers.add(userEntity);

            // Vérifier et établir la relation bidirectionnelle
            if (!userEntity.getTeams().contains(team)) {
                userEntity.getTeams().add(team);
            }
        }

        // Nettoyer les utilisateurs de l'équipe avant de définir les nouveaux
        team.getUsers().clear();
        team.getUsers().addAll(validUsers);

        // Sauvegarder et retourner l'équipe
        return teamRepo.save(team);
    }
    // Ajouter un utilisateur à une équipe
    @Transactional
    @Override
    public Optional<Team> addUserToTeam(Long teamId, Long userId) {
        Optional<Team> teamOptional = teamRepo.findById(teamId);
        Optional<User> userOptional = userRepo.findById(userId);

        if (teamOptional.isPresent() && userOptional.isPresent()) {
            Team team = teamOptional.get();
            User user = userOptional.get();
            team.getUsers().add(user);
            teamRepo.save(team);
            return Optional.of(team); // Successfully updated team
        }

        return Optional.empty(); // Either team or user not found
    }



    // Retirer un utilisateur d'une équipe
    @Transactional
    @Override
    public Team removeUserFromTeam(Long teamId, Long userId) {
        // Vérifier si l'équipe et l'utilisateur existent
        Team team = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Equipe non trouvée"));
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Retirer l'utilisateur de l'équipe et vice versa
        team.getUsers().remove(user);
        user.getTeams().remove(team);

        // Sauvegarder les entités mises à jour
        teamRepo.save(team);
        userRepo.save(user);

        return team;
    }

    // Créer une nouvelle équipe

@Override
public Optional<Team> getTeamById(Long teamId) {
        return teamRepo.findById(teamId);
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepo.findAll();
    }
    @Transactional
    @Override
    public Team updateTeam(Long teamId, Team teamDetails) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID : " + teamId));

        // Mettre à jour les propriétés de base
        team.setName(teamDetails.getName());
        // Autres propriétés à mettre à jour...

        return teamRepo.save(team);
    }

    @Transactional
    @Override
    public void deleteTeam(Long teamId) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID : " + teamId));

        // Nettoyer les références des utilisateurs à cette équipe
        for (User user : team.getUsers()) {
            user.getTeams().remove(team);
            userRepo.save(user);
        }

        teamRepo.delete(team);
    }

    @Transactional
    @Override
    public Team addUsersToTeam(Long teamId, List<Long> userIds) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID : " + teamId));

        for (Long userId : userIds) {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));

            // Ajouter l'utilisateur à l'équipe seulement s'il n'y est pas déjà
            if (!team.getUsers().contains(user)) {
                team.getUsers().add(user);
                user.getTeams().add(team);
                userRepo.save(user);
            }
        }

        return teamRepo.save(team);
    }

    @Override
    public List<User> getUsersByTeamId(Long teamId) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID : " + teamId));

        return new ArrayList<>(team.getUsers());
    }
}
