package tn.esprit.authservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.authservice.Entity.Role;

import java.util.Optional;

public interface RoleRepo extends JpaRepository<Role, Long> {

}
