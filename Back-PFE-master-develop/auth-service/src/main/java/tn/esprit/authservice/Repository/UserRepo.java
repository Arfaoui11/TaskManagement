package tn.esprit.authservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.authservice.Entity.User;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);

}// Corrected to "username"

