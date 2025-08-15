package tn.esprit.userservice.Service;

import io.micrometer.core.instrument.config.validate.Validated;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.userservice.Entity.*;
import tn.esprit.userservice.IService.IUserService;
import tn.esprit.userservice.Repository.PasswordResetTokenRepo;
import tn.esprit.userservice.Repository.RoleRepo;
import tn.esprit.userservice.Repository.TeamRepo;
import tn.esprit.userservice.Repository.UserRepo;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class UserService implements IUserService {
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private RoleRepo roleRepo;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TeamRepo teamRepo;
    @Autowired
    private PasswordResetTokenRepo tokenRepo;
    public UserService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Value("http://user-service") // Lien vers le microservice user
    private String userServiceUrl;
    @Override
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));  // Hash the password before saving
        return userRepo.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        log.info("getAllUsers");
        return userRepo.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepo.findById(id);
    }

    @Override
    public User updatedUser(Long id, User userDetails) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        if (userDetails.getFirstName() != null) user.setFirstName(userDetails.getFirstName());
        if (userDetails.getLastName() != null) user.setLastName(userDetails.getLastName());
        if (userDetails.getPhoneNumber() != null) user.setPhoneNumber(userDetails.getPhoneNumber());
        if (userDetails.getDateOfBirth() != null) user.setDateOfBirth(userDetails.getDateOfBirth());
        if (userDetails.getGender() != null) user.setGender(userDetails.getGender());
        if (userDetails.getPosition() != null) user.setPosition(userDetails.getPosition());
        if (userDetails.getAddress() != null) user.setAddress(userDetails.getAddress());

        // Rôle (valider avant d'affecter)
        if (userDetails.getRole() != null) {
            Role role = roleRepo.findById(userDetails.getRole().getId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        // Teams
        if (userDetails.getTeams() != null) {
            user.setTeams(userDetails.getTeams());
        }

        // Activé/désactivé (toujours mettre à jour)
        user.setActivated(userDetails.isActivated());

        user.setUpdatedAt(LocalDateTime.now());
        return userRepo.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        tokenRepo.deleteByUserId(id);
        userRepo.deleteById(id);
    }

    @Override
    public User assignUserToTeam(Long userId, Long teamId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Team team = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));

        user.getTeams().add(team);  // Ajouter l'équipe à l'utilisateur
        return userRepo.save(user);
    }



    @Override
    public User removeUserFromTeam(Long userId, Long teamId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Team team = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));

        user.getTeams().remove(team);  // Retirer l'équipe de l'utilisateur
        return userRepo.save(user);
    }


    @Override
    public User assignRoleToUser(Long userId, Long roleId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Role role = roleRepo.findById(roleId).orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        user.setRole(role);  // Assign role to the user
        return userRepo.save(user);
    }

    @Override
    public User getUserByEmail(@NotBlank(message = "Le nom d'utilisateur est obligatoire") String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public void inviteUser(UserDTO userDTO) {
        // Vérification de la validité des informations
        if (userDTO.getEmail() == null || userDTO.getUsername() == null || userDTO.getRoleId() == null) {
            throw new IllegalArgumentException("Les informations de l'utilisateur sont manquantes.");
        }

        // Récupération du rôle par ID
        Role role = roleRepo.findById(userDTO.getRoleId()).orElseThrow(() -> new RuntimeException("Role not found with id: " + userDTO.getRoleId()));

        // Création d'un nouvel utilisateur
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        user.setRole(role);  // Assigner le rôle
        user.setActivated(false);

        // Générer un OTP pour l'activation
        String otp = generateOtp();
        user.setOtp(otp);  // Sauvegarder l'OTP

        // Générer un token d'activation
        String activationToken = generateActivationToken(userDTO.getEmail());

        // Sauvegarder l'utilisateur dans la base de données (avec un token d'activation)
        user.setActivationToken(activationToken);  // Assigner le token d'activation
        userRepo.save(user);

        // Envoi de l'OTP par email avec le lien d'activation
        sendOtpEmail(userDTO.getEmail(), otp, userDTO.getUsername(), activationToken);
    }

    // Méthode pour générer un token d'activation (par exemple, un UUID)
    private String generateActivationToken(String email) {
        // Vous pouvez utiliser un UUID pour générer un token unique
        return UUID.randomUUID().toString();
    }

    // Méthode pour générer un OTP
    private String generateOtp() {
        // Logique pour générer un OTP (ex: un code de 6 chiffres)
        Random rand = new Random();
        int otp = 100000 + rand.nextInt(900000);  // Générer un nombre entre 100000 et 999999
        return String.valueOf(otp);
    }



    @Override
    public void sendOtpEmail(String email, String otp, String username, String activationToken) {
        String subject = "Code OTP pour votre activation";

        // Créer le message de l'email en utilisant les paramètres passés à la méthode
        String message = "Bonjour " + username + ",\n\n" +
                "Nous vous invitons à rejoindre notre plateforme.\n" +
                "Détails de votre invitation :\n" +
                "Nom d'utilisateur : " + username + "\n" +
                "Email : " + email + "\n\n" +
                "Veuillez utiliser le code OTP suivant pour confirmer votre invitation : " + otp + "\n\n" +
                "Vous pouvez compléter votre enregistrement en cliquant sur ce lien : " +
                "http://localhost:4200/users/confirm-identity/" + activationToken +
                "\n\n" +
                "Cordialement,\nL'équipe.";

        // Créer un objet SimpleMailMessage pour envoyer l'email
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);

        // Envoyer l'email via JavaMailSender
        mailSender.send(mailMessage);
    }



    @Override
    public void activateUser(String otp, String activationToken) {
        // Trouver l'utilisateur par le token d'activation
        User user = userRepo.findByActivationToken(activationToken);
        System.out.println(otp);
        System.out.println(activationToken);
        // Vérifier si l'utilisateur existe et si l'OTP est valide
//        if (user == null || user.getOtp() == null || !user.getOtp().equals(otp)) {
//            throw new RuntimeException("Token d'activation ou OTP invalide");
//        }

        // Mettre à jour l'état de l'utilisateur pour l'activer
        user.setActivated(true);
        user.setOtp(null);  // Supprimer l'OTP après activation
        user.setActivationToken(null);  // Supprimer le token d'activation après activation

        // Sauvegarder l'utilisateur activé dans la base de données
        userRepo.save(user);
    }


    @Override
    public void completeRegistration(CompleteRegistrationDto dto) {
        // Vérification de l'utilisateur
        User user = userRepo.findByEmail(dto.getEmail());
        if (user == null) {
            throw new IllegalArgumentException("Aucun compte associé à cet email.");
        }

        if (!user.isActivated()) {
            throw new IllegalArgumentException("Le compte n'est pas encore activé.");
        }

        // Vérification de la correspondance des mots de passe
        if (!dto.passwordsMatch()) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas.");
        }

        // Mise à jour des informations utilisateur
        updateUserInformation(user, dto);

        user.setUpdatedAt(LocalDateTime.now());  // Mise à jour de la date de modification
        userRepo.save(user);  // Sauvegarde des modifications
    }

    private void updateUserInformation(User user, CompleteRegistrationDto dto) {
        if (dto.getUsername() != null && !dto.getUsername().isEmpty()) {
            user.setUsername(dto.getUsername());
        }

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));  // Hachage du mot de passe
        }

        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }

        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }

        if (dto.getPhoneNumber() != null) {
            user.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getCreatedAt() != null) {
            user.setCreatedAt(dto.getCreatedAt());
        }

        if (dto.getDateOfBirth() != null) {
            user.setDateOfBirth(dto.getDateOfBirth());
        }

        if (dto.getGender() != null) {
            user.setGender(dto.getGender());
        }

        if (dto.getPosition() != null) {
            user.setPosition(dto.getPosition());
        }

        if (dto.getAddress() != null) {
            user.setAddress(dto.getAddress());
        }

        // Si nécessaire, vérification du rôle
        if (user.getRole() == null) {
            throw new IllegalStateException("Le rôle de l'utilisateur n'est pas défini.");
        }
    }
    public UserDTO getUserByIdU(Long userId) {
        String url = userServiceUrl + "/api2/users/" + userId;
        return restTemplate.getForObject(url, UserDTO.class);
    }
    public boolean isEmailTaken(String email) {
        return userRepo.existsByEmail(email);
    }

   
    public User save(User user) {
        // 🔹 Tu peux ajouter des vérifications avant de sauvegarder
        if (user == null) {
            throw new IllegalArgumentException("L'utilisateur ne peut pas être null");
        }

        // Exemple : vérifier que l'email n'est pas vide
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new IllegalArgumentException("L'email de l'utilisateur est obligatoire");
        }

        // 🔹 Sauvegarde l'utilisateur en base
        return userRepo.save(user);
    }

    public Optional<User> findById(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("L'ID de l'utilisateur ne peut pas être null");
        }

        return userRepo.findById(userId);
    }
}
