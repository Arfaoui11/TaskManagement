package tn.esprit.userservice.Entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.codehaus.jackson.annotate.JsonBackReference;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")

@Table(name = "app_user")  // Changing table name to avoid reserved keyword
public class User implements Serializable {

    private static final long serialVersionUID = 983648238746032841L;

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private String username;
    private String password;
    private String otp;  // Champ OTP
    private boolean activated=false;
    private String email;

    private String client_id;

    // Use a Set instead of List for roles to avoid duplicates
    @ManyToOne(fetch =FetchType.EAGER, cascade= CascadeType.DETACH)
    //@loinColumn(name "role_id")
    private Role role;
    // Relation with Team
    @ManyToMany(mappedBy = "users", cascade = CascadeType.ALL)
    @JsonIgnore
    @JsonBackReference

    private Set<Team> teams = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
private String ConfirmPassword;
    private String firstName;  // First name of the user
    private String lastName;   // Last name of the user
    private String phoneNumber; // Phone number for the user
    private String activationToken;  // Token for account activation
    private LocalDateTime activationExpiration;  // Expiration time for the activation token
    private Date dateOfBirth;  // Optional: Date of birth for the user
    @Enumerated(EnumType.STRING)
    private Gender gender;  // Gender of the user (using Enum)
    private String position;  // Job title or position of the user
    private String address;  // Address of the user
    // Optional constructor
    public User(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }



    // Remove unnecessary orElseThrow method
}
