package tn.esprit.authservice.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.authservice.Entity.User;
import tn.esprit.authservice.Repository.UserRepo;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Logger log = LoggerFactory.getLogger(UserService.class);

    @Override
    public void save(User user) {
        log.info("saving user");
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public Optional<User> update(Long userId, User user) {
        return userRepo.findById(userId).map(existingUser -> {
            // Only encode password if it's being updated
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            // Update other fields as needed
            if (user.getUsername() != null) {
                existingUser.setUsername(user.getUsername());
            }
            // Add other field updates as needed
            return userRepo.save(existingUser);
        });
    }

    // Other methods remain the same
    @Override
    public void delete(Long userId) {
        userRepo.deleteById(userId);
    }

    @Override
    public List<User> getUsers() {
        return userRepo.findAll();
    }

    @Override
    public Optional<User> getUserById(Long userId) {
        return userRepo.findById(userId);
    }

    @Override
    public User getUserByUserName(String userName) {
        return userRepo.findByUsername(userName);
    }
}