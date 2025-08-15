package tn.esprit.authservice.Entity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class MyUserDetails implements UserDetails {
    private static final long serialVersionUID = 1L;
    private final User user;

    public MyUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();

        if (user.getRole() != null) {
            Role role = user.getRole();
            if (role.getName() != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            }

            if (role.getPermissions() != null) {
                role.getPermissions().forEach(permission -> {
                    if (permission != null && permission.getName() != null) {
                        authorities.add(new SimpleGrantedAuthority(permission.getName()));
                    }
                });
            }
        }

        return authorities;
    }

    @Override
    public String getPassword() {

        System.out.println(this.user.getPassword());
        return this.user.getPassword();
    }

    @Override
    public String getUsername() {
        System.out.println(this.user.getEmail());
        return
                this.user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public User getUserDetails() {
        return user;
    }
}
