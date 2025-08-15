package tn.esprit.userservice.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.Entity.Permission;
import tn.esprit.userservice.Service.PermissionService;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    // ✅ Récupérer toutes les permissions
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    // ✅ Récupérer une permission par ID
    @GetMapping("/{id}")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getPermissionById(id));
    }

    // ✅ Ajouter une nouvelle permission
    @PostMapping
    public ResponseEntity<Permission> createPermission(@RequestBody Permission permission) {
        return ResponseEntity.ok(permissionService.createPermission(permission));
    }

    // ✅ Mettre à jour une permission
    @PutMapping("/{id}")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        return ResponseEntity.ok(permissionService.updatePermission(id, permission));
    }

    // ✅ Supprimer une permission
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/role/{id}")
    public ResponseEntity<Void> deletePermissionRole(@PathVariable Long id) {
        permissionService.deletePermissionRole(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
