package tn.esprit.authservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.authservice.Entity.Permission;  // Correct import for your custom Permission class

public interface PermissionRepo extends JpaRepository<Permission, Long> {

}
