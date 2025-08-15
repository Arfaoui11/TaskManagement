package tn.esprit.userservice.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.esprit.userservice.Entity.*;
import tn.esprit.userservice.Repository.*;

import javax.transaction.Transactional;
import java.util.*;

@Component
public class SetupDataLoader implements ApplicationListener<ContextRefreshedEvent> {
    private boolean alreadySetup = false;

    @Autowired
    private UserRepo userRepository;
    @Autowired
    private RoleRepo roleRepository;
    @Autowired
    private PermissionRepo permissionRepo;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void onApplicationEvent(final ContextRefreshedEvent event) {
        if (alreadySetup) {
            return;
        }

        // Create initial Permissions
        Permission perUser1 = createPermissionIfNotFound("create_user");
        Permission perUser2 = createPermissionIfNotFound("read_users");
        Permission perUser6 = createPermissionIfNotFound("read_users_project");
        Permission perUser3 = createPermissionIfNotFound("read_user");
        Permission perUser4 = createPermissionIfNotFound("update_user");
        Permission perUser5 = createPermissionIfNotFound("delete_user");

        // Create initial Roles
        Role superAdminRole = createRoleIfNotFound("super_admin", Set.of(perUser1, perUser2, perUser3, perUser4, perUser5, perUser6));
        Role adminRole = createRoleIfNotFound("admin", Set.of(perUser1, perUser6, perUser3, perUser4, perUser5));
        Role userRole = createRoleIfNotFound("user", Set.of(perUser3, perUser4));

        // Create initial User with Role Admin
        createUserIfNotFound("admin@gmail.com", superAdminRole);

        // Create initial Client with Role Client
        createClientIfNotFound("Wevioo_client");

        alreadySetup = true;
    }

    @Transactional
    public User createUserIfNotFound(final String email, Role role) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setUsername("admin");
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("admin"));

            // Convert List to Set to match the expected field type
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRole(role);

            user.setClient_id("Wevioo_client");
            user = userRepository.save(user);
        }
        return user;
    }

    @Transactional
    public AppClient createClientIfNotFound(String clientId) {
        AppClient client = clientRepository.findByClientId(clientId);
        if (client == null) {
            client = new AppClient();
            client.setClientId(clientId);
            client.setClientSecret(passwordEncoder.encode("wevioo"));
            client.setAccessTokenValidity(36000);
            client.setRefreshTokenValidity(36000);
            client.setAuthorities("ROLE_CLIENT");
            client.setAuthorizedGrantTypes("password,authorization_code,refresh_token,client_credentials");
            client.setAutoApprove("false");
            client.setResourceIds("user-resource,uploads-resource,oauth2-resource,client-resource,django-resource");
            client.setScope("view,create,update,delete");
            client.setWebServerRedirectUri("http://localhost:8082/login,http://localhost:8083/login,http://localhost:8084/login,http://localhost:8085/callback");
            client = clientRepository.save(client);
        }
        return client;
    }

    @Transactional
    public Role createRoleIfNotFound(final String name, Set<Permission> permissions) {
        Role role = roleRepository.findByName(name);
        if (role == null) {
            role = new Role(name, permissions);
            role = roleRepository.save(role);
        }
        return role;
    }

    @Transactional
    public Permission createPermissionIfNotFound(final String name) {
        List<Permission> permissions = permissionRepo.findByName(name);
        if (permissions.isEmpty()) {
            return permissionRepo.save(new Permission(name));
        }
        return permissions.get(0); // retourne le premier trouvé
    }

}