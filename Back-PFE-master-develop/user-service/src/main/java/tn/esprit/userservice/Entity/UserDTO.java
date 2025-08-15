package tn.esprit.userservice.Entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private String username;
    private String email;
    private Long roleId;  // Rôle par ID
    private String otp;   // Code OTP pour la vérification
    // Constructeur
    public UserDTO(String username, String email, Long roleId, String otp) {
        this.username = username;
        this.email = email;
        this.roleId = roleId;
        this.otp = otp;
    }
}
