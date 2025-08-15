package tn.esprit.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.userservice.Entity.Permission;

import java.util.List;

public interface PermissionRepo extends JpaRepository<Permission, Long> {
    List<Permission> findByName(String name);
}
