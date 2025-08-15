package tn.esprit.authservice.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.authservice.Entity.MyUserDetails;
import tn.esprit.authservice.Entity.User;
import tn.esprit.authservice.Service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    Logger log = LoggerFactory.getLogger(UserController.class);

    @PostMapping
    public ResponseEntity<String> saveuser(@RequestBody User user) {
        userService.save(user);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllusers() {
        return new ResponseEntity<>(userService.getUsers(), HttpStatus.FOUND);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getuserById(@PathVariable("id") Long userId) {
        log.info("inside get mapping getbyid " + SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
        User user = userService.getUserById(userId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateuser(@RequestBody User user, @PathVariable("id") Long userId) {
        User updatedUser = userService.update(userId, user).orElse(null);
        if (updatedUser == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(updatedUser, headers, HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteuser(@PathVariable("id") Long userId) {
        userService.delete(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Changed the mapping to avoid ambiguity
    @GetMapping("/me")
    public ResponseEntity<User> getuserByAuthentication(Authentication auth) {
        log.info("inside me " + SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        if (SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString().equals("anonymousUser"))
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.info("inside me " + auth.getName());
        User user = userService.getUserByUserName(userDetails.getUsername());

        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}
