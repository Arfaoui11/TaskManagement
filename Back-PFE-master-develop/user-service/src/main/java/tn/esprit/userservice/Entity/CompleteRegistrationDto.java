package tn.esprit.userservice.Entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

// Assurez-vous que Gender est une énumération définie ailleurs dans votre projet
import tn.esprit.userservice.Entity.Gender;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompleteRegistrationDto {
    // Pas besoin de @Id dans un DTO. Cela appartient à l'entité.
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String firstName;
    private String lastName;
    private LocalDateTime createdAt;

    private String phoneNumber;
    private Date dateOfBirth;

    private Gender gender;  // Assurez-vous que Gender est une énumération avec des valeurs valides

    private String position;  // Job title or position of the user
    private String address;

    // Vous pouvez ajouter une méthode de validation pour vérifier si les mots de passe correspondent
    public boolean passwordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
}
