package tn.esprit.userservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.Entity.*;
import tn.esprit.userservice.Service.EmailService;
import tn.esprit.userservice.Service.RoleService;
import tn.esprit.userservice.Service.UserService;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private RoleService roleService;


    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
//    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();

    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateuser(@RequestBody UserDTO userDTO, @PathVariable("id") Long userId) {
        User user = userService.findById(userId).orElse(null);
        if (user == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());

        // Charger le Role par son ID
        Optional<Role> roleOpt = roleService.getRoleById(userDTO.getRoleId());
        if (!roleOpt.isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        user.setRole(roleOpt.get());

        // Sauvegarde finale
        User updatedUser = userService.save(user);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(updatedUser);
    }




    @DeleteMapping("/{id}")
    public ResponseEntity<User> deleteUser(@PathVariable Long id) {
        Optional<User> userOptional = userService.getUserById(id);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();

    }

    @PutMapping("/{userId}/team/{teamId}")
    public ResponseEntity<User> assignUserToTeam(@PathVariable Long userId, @PathVariable Long teamId) {
        return ResponseEntity.ok(userService.assignUserToTeam(userId, teamId));
    }

    // Retirer un utilisateur d'une équipe
    @PutMapping("/{userId}/remove-team")
    public ResponseEntity<User> removeUserFromTeam(@PathVariable Long userId, @PathVariable Long teamId) {
        return ResponseEntity.ok(userService.removeUserFromTeam(userId,teamId));
    }

    // Assigner un rôle à un utilisateur
    @PutMapping("/{userId}/role/{roleId}")
    public ResponseEntity<User> assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        return ResponseEntity.ok(userService.assignRoleToUser(userId, roleId));
    }
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/invite")
    public ResponseEntity<Void> inviteUser(@Valid @RequestBody UserDTO userDTO) {
        userService.inviteUser(userDTO);
        return ResponseEntity.noContent().build();
    }

    // Activer un utilisateur avec un OTP
    @PostMapping("/activate")
    public ResponseEntity<?> activateUser(@RequestBody ActivationUserDTO activation) {

        // Validation des paramètres
//        if (activation.getOtp() == null || activation.getOtp().isEmpty() || activation.getActivationToken() == null || activation.getActivationToken().isEmpty()) {
//            return ResponseEntity.badRequest().body("OTP ou Token d'activation manquant");
//        }

        try {
            // Appeler la méthode de service pour activer l'utilisateur
            userService.activateUser(activation.getOtp(), activation.getActivationToken());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (RuntimeException e) {
            // En cas d'erreur, retourner un message d'erreur
            return ResponseEntity.badRequest().body("Erreur d'activation : " + e.getMessage());
        }
    }

    @GetMapping("/check-email")
    public boolean checkEmail(@RequestParam String email) {
        return userService.isEmailTaken(email);
    }
    // Compléter l'enregistrement de l'utilisateur
    @PostMapping("/complete-registration")
    public ResponseEntity<Void> completeRegistration(@Valid @RequestBody CompleteRegistrationDto dto) {
        userService.completeRegistration(dto);
        return ResponseEntity.noContent().build();
    }
}
