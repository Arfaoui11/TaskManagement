package tn.esprit.authservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.authservice.Entity.AppClient;

@Repository
public interface ClientRepository extends JpaRepository<AppClient, String> {

    AppClient findByClientId(String clientId);

}
