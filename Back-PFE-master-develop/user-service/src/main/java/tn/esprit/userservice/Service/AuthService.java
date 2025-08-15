package tn.esprit.userservice.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.userservice.Entity.*;
import tn.esprit.userservice.Repository.PasswordResetTokenRepo;
import tn.esprit.userservice.Repository.UserRepo;

import javax.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class AuthService {


    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordResetTokenRepo passwordResetTokenRepo;
    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String client_id = "Wevioo_client";
    private final String client_secret = "wevioo";

   

    public ResponseEntity<?> authenticateUser(LoginRequest loginRequest, HttpSession session) throws JsonProcessingException {


            log.info("🟢 Attempting login with email: {}", loginRequest.getEmail());

        // Check if the user exists
        if (!userRepo.existsByEmail(loginRequest.getEmail())) {
            log.warn("🔴 User not found: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "User not found: " + loginRequest.getEmail()));
        }

        // Generate credentials for OAuth2 authentication
        String credentials = client_id + ":" + client_secret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.add("Authorization", "Basic " + encodedCredentials);

        HttpEntity<String> request = new HttpEntity<>(headers);
        String tokenUrl = "http://auth-service/oauth/token?grant_type=password&username="
                + loginRequest.getUsername() + "&password=" + loginRequest.getPassword();

        log.info("🔹 Sending request to OAuth2 Mahdi: {}", tokenUrl);

        ResponseEntity<String> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, String.class);
        log.info("🟢 OAuth2 server response: {}", response.getBody());

        // Extract the token from the JSON response
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(response.getBody());

        String token = node.path("access_token").asText();
        int expiresIn = node.path("expires_in").asInt();
        String refreshToken = node.path("refresh_token").asText();

        log.info("🟢 Token retrieved: {}", token);
        log.info("🕒 Expires in: {} seconds", expiresIn);

        // Retrieve the user and check roles
        User userDTO = userService.getUserByEmail(loginRequest.getEmail());

        if (userDTO == null) {
            log.error("🔴 User not found in database: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "User not found in database"));
        }

        if (userDTO.getRole() == null) {
            log.error("⚠️ L'utilisateur {} n'a pas de rôle assigné.", userDTO.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Aucun rôle assigné à cet utilisateur."));
        }

        // Map roles and permissions to granted authorities
        List<GrantedAuthority> authorities = new ArrayList<>();
        Role role = userDTO.getRole();  // get role from userDTO

        // Add the role as an authority
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));

        // Check if the role has permissions and add them as authorities
        if (role.getPermissions() != null) {
            for (Permission permission : role.getPermissions()) {
                if (permission != null) {
                    authorities.add(new SimpleGrantedAuthority(permission.getName()));
                }
            }
        }

        // Update security context with the new roles and permissions
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDTO.getUsername(), null, authorities)
        );

        // Store security context and role in session
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
        session.setAttribute("role", authorities.toString());

        // Create response body
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("refreshToken", refreshToken);
        responseBody.put("expiresIn", expiresIn);
        responseBody.put("user", userDTO);

        log.info("✅ Authentication successful for {}", userDTO.getUsername());
        return ResponseEntity.ok(responseBody);
    }

    public ResponseEntity<?> forgotPassword(String email) {
        log.info("🔹 Demande de réinitialisation pour l'email : {}", email);

        // Vérifier si l'utilisateur existe
        Optional<User> userOptional = userRepo.findOptionalByEmail(email);
        if (!userOptional.isPresent()) {
            log.warn("🔴 Aucun utilisateur trouvé avec cet email : {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Utilisateur non trouvé."));
        }

        User user = userOptional.get();

        // Générer un token aléatoire
        String token = UUID.randomUUID().toString();
        log.info("🟢 Token généré : {}", token);

        // Définir une expiration (ex: 1 heure)
        LocalDateTime expirationTime = LocalDateTime.now().plusHours(1);

        // Enregistrer le token en base
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expirationTime);
        passwordResetTokenRepo.save(resetToken);
        log.info("✅ Token enregistré en base pour l'email : {}", user.getEmail());

        // Générer le lien de réinitialisation
        String resetLink = "http://localhost:4200/auth/reset-password/" + token;
        log.info("📩 Lien de réinitialisation envoyé : {}", resetLink);

        // Envoyer l'email
        emailService.sendEmail(user.getEmail(), "Réinitialisation du mot de passe",
                "Cliquez ici pour réinitialiser votre mot de passe : " + resetLink);

        return ResponseEntity.ok(Collections.singletonMap("message", "Email envoyé avec succès."));


        
        
    }

    public ResponseEntity<?> resetPassword(String token, String newPassword) {
        log.info("🔹 Début du processus de réinitialisation du mot de passe avec le token: {}", token);

        // Vérification si le token est null ou vide
        if (token == null || token.isEmpty()) {
            log.warn("⚠️ Token manquant dans la requête !");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Token manquant"));
        }

        // Rechercher le token dans la base de données
        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepo.findByToken(token);

        if (optionalToken.isEmpty()) {
            log.warn("❌ Token introuvable dans la base de données : {}", token);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Token invalide ou inexistant"));
        }

        PasswordResetToken resetToken = optionalToken.get();
        LocalDateTime expirationDateTime = resetToken.getExpirationTime();

        log.info("🔎 Token trouvé, expiration prévue à : {}", expirationDateTime);

        // Vérification de l'expiration du token
        if (expirationDateTime.isBefore(LocalDateTime.now())) {
            log.warn("🔴 Token expiré : {}", expirationDateTime);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Le token de réinitialisation a expiré."));
        }

        // Récupération de l'utilisateur associé au token
        User user = resetToken.getUser();
        if (user == null) {
            log.error("🚨 Aucun utilisateur associé au token: {}", token);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Aucun utilisateur associé à ce token"));
        }

        log.info("🟢 Utilisateur trouvé : {} - Email : {}", user.getUsername(), user.getEmail());

        // Mise à jour du mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        log.info("✅ Mot de passe mis à jour avec succès pour : {}", user.getEmail());

        // Suppression du token après utilisation
        passwordResetTokenRepo.delete(resetToken);
        log.info("🗑️ Token supprimé après utilisation : {}", token);

        return ResponseEntity.ok(Collections.singletonMap("message", "Mot de passe réinitialisé avec succès"));
    }

    public ResponseEntity<?> refreshToken(String refreshToken) throws JsonProcessingException {
        log.info("🔹 Attempting to refresh the token using refresh token: {}", refreshToken);

        // Check if the refresh token is null or empty
        if (refreshToken == null || refreshToken.isEmpty()) {
            log.warn("🔴 Refresh token is missing in the request.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Refresh token is missing"));
        }

        // Generate credentials for OAuth2 authentication
        String credentials = client_id + ":" + client_secret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.add("Authorization", "Basic " + encodedCredentials);

        // Construct the URL for refreshing the token
        String tokenUrl = "http://auth-service/oauth/token?grant_type=refresh_token&refresh_token=" + refreshToken;

        // Send the request to refresh the token
        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, String.class);

        log.info("🟢 OAuth2 server response: {}", response.getBody());

        // Extract the token from the JSON response
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(response.getBody());

        String newToken = node.path("access_token").asText();
        String newRefreshToken = node.path("refresh_token").asText();

        log.info("🟢 New token retrieved: {}", newToken);

        // Return the new token and refresh token
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", newToken);
        responseBody.put("refreshToken", newRefreshToken);

        return ResponseEntity.ok(responseBody);
    }
}
