package tn.esprit.userservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.Entity.Permission;
import tn.esprit.userservice.Entity.Role;
import tn.esprit.userservice.Entity.User;
import tn.esprit.userservice.Service.RoleService;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleService.createRole(role);
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        Optional<Role> role = roleService.getRoleById(id);
        return role.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role roleDetails) {
        Optional<Role> roleOptional = roleService.getRoleById(id);
        if (roleOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        roleDetails.setId(id);
        Role updatedRole = roleService.updateRole(id, roleDetails);
        return ResponseEntity.ok(updatedRole);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Role> deleteUser(@PathVariable Long id) {
        Optional<Role> userOptional = roleService.getRoleById(id);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();

    }


    @GetMapping("/{id}/permissions")
    public ResponseEntity<Set<Permission>> getPermissionsByRole(@PathVariable Long id) {
        Optional<Role> roleOptional = roleService.getRoleById(id);
        if (roleOptional.isPresent()) {
            return ResponseEntity.ok(roleOptional.get().getPermissions());
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/{roleId}/permissions/{permissionId}")
    public Role addPermissionToRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        return roleService.addPermissionToRole(roleId, permissionId);
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public Role deletePermissionFromRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        return roleService.deletePermissionFromRole(roleId, permissionId);
    }


}
