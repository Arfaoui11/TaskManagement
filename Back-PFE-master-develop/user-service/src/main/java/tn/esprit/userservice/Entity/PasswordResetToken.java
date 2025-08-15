package tn.esprit.userservice.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    private LocalDateTime expirationTime;

    public PasswordResetToken(String token, User user, LocalDateTime expirationTime) {
        this.token = token;
        this.user = user;

        this.expirationTime = expirationTime;
    }
}
