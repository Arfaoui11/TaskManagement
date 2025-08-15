package tn.esprit.userservice.Entity;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    public String getUsername() {
        return email;
    }
}
