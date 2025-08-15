package tn.esprit.userservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.Entity.Permission;
import tn.esprit.userservice.Entity.Role;
import tn.esprit.userservice.Entity.User;
import tn.esprit.userservice.IService.IRoleService;
import tn.esprit.userservice.Repository.PermissionRepo;
import tn.esprit.userservice.Repository.RoleRepo;
import tn.esprit.userservice.Repository.UserRepo;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService implements IRoleService {

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private PermissionRepo permissionRepo;

    @Autowired
    private UserRepo userRepo;  // Ajoute un accès au repository des utilisateurs

    @Override
    public Role createRole(Role role) {
        return roleRepo.save(role);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepo.findAll();
    }

    @Override
    public Optional<Role> getRoleById(Long id) {
        return roleRepo.findById(id);
    }

    @Override
    public Role updateRole(Long id, Role roleDetails) {
        Role role = roleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found for this id :: " + id));

        role.setName(roleDetails.getName());
        role.setPermissions(roleDetails.getPermissions());
        return roleRepo.save(role);
    }

    @Override
    public boolean deleteRole(Long id) {
        Role role = roleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found for this id :: " + id));

        // Dissocier les utilisateurs du rôle avant de supprimer
        List<User> usersWithRole = userRepo.findByRoleId(id);  // Trouver les utilisateurs associés à ce rôle
        if (!usersWithRole.isEmpty()) {
            for (User user : usersWithRole) {
                user.setRole(null);  // Dissocier le rôle de l'utilisateur
                userRepo.save(user);
            }
        }

        // Une fois les utilisateurs dissociés, supprimer le rôle
        roleRepo.delete(role);
        return false;
    }

    @Override
    public Role deletePermissionFromRole(Long roleId, Long permissionId) {
        Optional<Role> roleOpt = roleRepo.findById(roleId);
        if (roleOpt.isPresent()) {
            Role role = roleOpt.get();
            role.getPermissions().removeIf(permission -> permission.getId().equals(permissionId));
            return roleRepo.save(role);
        }
        return null;
    }

    @Override
    public Role addPermissionToRole(Long roleId, Long permissionId) {
        Optional<Role> roleOpt = roleRepo.findById(roleId);
        Optional<Permission> permissionOpt = permissionRepo.findById(permissionId);

        if (roleOpt.isPresent() && permissionOpt.isPresent()) {
            Role role = roleOpt.get();
            Permission permission = permissionOpt.get();
            role.getPermissions().add(permission);
            return roleRepo.save(role);
        }
        return null;
    }
}
