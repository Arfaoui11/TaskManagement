package tn.esprit.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.userservice.Entity.Role;

import java.util.Optional;

public interface RoleRepo extends JpaRepository<Role, Long> {
    Role findByName(String name);
}
