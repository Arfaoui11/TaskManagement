package tn.esprit.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.userservice.Entity.AppClient;


public interface ClientRepository extends JpaRepository<AppClient, Long> {
    AppClient findByClientId(String clientId);
}
