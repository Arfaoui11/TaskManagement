package tn.esprit.authservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tn.esprit.authservice.Entity.User;
import tn.esprit.authservice.Repository.UserRepo;

import java.util.HashSet;
import java.util.Set;

@Service
public class MyUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        if (user.getRole() == null) {
            throw new RuntimeException("Aucun rôle attribué à cet utilisateur.");
        }

        Set<GrantedAuthority> authorities = new HashSet<>();

        // Ajouter le rôle principal de l'utilisateur
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName().toUpperCase()));

        // Ajouter les permissions associées au rôle
        if (user.getRole().getPermissions() != null) {
            user.getRole().getPermissions().forEach(permission -> {
                if (permission != null && permission.getName() != null) {
                    authorities.add(new SimpleGrantedAuthority(permission.getName()));
                }
            });
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), authorities);
    }
}
