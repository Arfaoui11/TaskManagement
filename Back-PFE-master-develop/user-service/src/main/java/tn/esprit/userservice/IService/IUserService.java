package tn.esprit.userservice.IService;

import tn.esprit.userservice.Entity.CompleteRegistrationDto;
import tn.esprit.userservice.Entity.User;
import tn.esprit.userservice.Entity.UserDTO;

import javax.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;

public interface IUserService {



    User createUser(User user);

    List<User> getAllUsers();

    Optional<User> getUserById(Long id);

    User updatedUser(Long id, User userDetails);

    void deleteUser(Long id);

    User assignUserToTeam(Long userId, Long teamId);



    User removeUserFromTeam(Long userId, Long teamId);

    User assignRoleToUser(Long userId, Long roleId);

    User getUserByEmail(@NotBlank(message = "Le nom d'utilisateur est obligatoire") String email);


    void inviteUser(UserDTO userDTO);


    void sendOtpEmail(String email, String otp, String username, String activationToken);

    UserDTO getUserByIdU(Long userId);

    void activateUser(String otp, String activationToken);

    void completeRegistration(CompleteRegistrationDto dto);
}
