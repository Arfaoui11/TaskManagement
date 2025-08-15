package tn.esprit.userservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.Entity.Team;
import tn.esprit.userservice.Entity.User;
import tn.esprit.userservice.Service.TeamService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    // Create a team
    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        if (team == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            Team createdTeam = teamService.createTeam(team);
            return new ResponseEntity<>(createdTeam, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a team
    @PutMapping("/{teamId}")
    public ResponseEntity<Team> updateTeam(@PathVariable Long teamId, @RequestBody Team teamDetails) {
        if (teamDetails == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            Team updatedTeam = teamService.updateTeam(teamId, teamDetails);
            return ResponseEntity.ok(updatedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete a team
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long teamId) {
        try {
            teamService.deleteTeam(teamId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add user to a team
    @PutMapping("/{teamId}/addUser/{userId}")
    public ResponseEntity<Team> addUserToTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        Optional<Team> updatedTeam = teamService.addUserToTeam(teamId, userId);

        return updatedTeam.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    // Add multiple users to a team
    @PostMapping("/{teamId}/add-users")
    public ResponseEntity<Team> addUsersToTeam(@PathVariable Long teamId, @RequestBody List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            Team updatedTeam = teamService.addUsersToTeam(teamId, userIds);
            return ResponseEntity.ok(updatedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Remove user from a team
    @PutMapping("/{teamId}/remove-user/{userId}")
    public ResponseEntity<Team> removeUserFromTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        try {
            Team updatedTeam = teamService.removeUserFromTeam(teamId, userId);
            return ResponseEntity.ok(updatedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get team by ID
    @GetMapping("/{teamId}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long teamId) {
        try {
            Optional<Team> team = teamService.getTeamById(teamId);
            return team.map(t -> {
                // Hide sensitive information
                t.getUsers().forEach(user -> user.setPassword(null));
                return ResponseEntity.ok(t);
            }).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all teams
    @GetMapping()
    public List<Team> getAllTeams() {
        return teamService.getAllTeams();
    }

    // Get all users by team ID
    // Get all users by team ID
    @GetMapping("/{teamId}/users")
    public ResponseEntity<List<User>> getUsersByTeamId(@PathVariable Long teamId) {
        try {
            List<User> users = teamService.getUsersByTeamId(teamId);
            // Hide sensitive information
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
