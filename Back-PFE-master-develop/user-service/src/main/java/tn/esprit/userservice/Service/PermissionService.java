package tn.esprit.userservice.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.Entity.Permission;
import tn.esprit.userservice.Entity.Role; // Importer la classe Role de votre entité
import tn.esprit.userservice.IService.IPermissionService;
import tn.esprit.userservice.Repository.PermissionRepo;

import javax.transaction.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService implements IPermissionService {

    private final PermissionRepo permissionRepository;

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));
    }

    @Override
    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    @Override
    public Permission updatePermission(Long id, Permission permission) {
        Permission existingPermission = getPermissionById(id);
        existingPermission.setName(permission.getName());
        existingPermission.setRoles(permission.getRoles()); // Correction ici: mettez à jour la liste des rôles
        return permissionRepository.save(existingPermission);
    }

    @Transactional
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        // Supprimer la permission des rôles avant de la supprimer
        for (Role role : permission.getRoles()) {
            role.getPermissions().remove(permission);
        }

        permissionRepository.delete(permission);
    }


    @Transactional
    public void deletePermissionRole(Long id) {
        // Récupérer la permission par son ID
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        // Retirer la permission de tous les rôles associés
        for (Role role : permission.getRoles()) {
            role.getPermissions().remove(permission); // Retirer la permission du rôle
        }

        // Supprimer la permission
        permissionRepository.delete(permission);
    }
}
