package tn.esprit.authservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.authservice.Entity.Team;

import java.util.Optional;

public interface TeamRepo extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);

}
