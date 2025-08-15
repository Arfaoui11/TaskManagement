package tn.esprit.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.userservice.Entity.Role;
import tn.esprit.userservice.Entity.Team;

public interface TeamRepo extends JpaRepository<Team, Long> {
}
