package tn.esprit.authservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.authservice.Entity.Team;
import tn.esprit.authservice.Entity.TeamDto;
import tn.esprit.authservice.Repository.TeamRepo;

@RestController
@RequestMapping("/api2/teams")
public class TeamController {

    @Autowired
    private TeamRepo teamRepository;

    @GetMapping("/{id}")
    public TeamDto getTeamById(@PathVariable Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team non trouvée"));
        return new TeamDto(team.getId(), team.getName());
    }
}

