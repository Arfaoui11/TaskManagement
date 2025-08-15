package tn.esprit.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.userservice.Entity.User;

import javax.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);


    

    boolean existsByEmail(@NotBlank(message = "Le nom d'utilisateur est obligatoire") String email);

    User findByEmail(String email);

    Optional<User> findOptionalByEmail(String email);

    User findByActivationToken(String token);

    User findByOtp(String otp);

    List<User> findByRoleId(Long id);
}
