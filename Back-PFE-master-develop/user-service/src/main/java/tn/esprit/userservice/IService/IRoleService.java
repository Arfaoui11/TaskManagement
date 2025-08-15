package tn.esprit.userservice.IService;

import tn.esprit.userservice.Entity.Role;

import java.util.List;
import java.util.Optional;

public interface IRoleService {

    Role createRole(Role role);

    List<Role> getAllRoles();

    Optional<Role> getRoleById(Long id);

    Role updateRole(Long id, Role roleDetails);

    boolean deleteRole(Long id);

    Role deletePermissionFromRole(Long roleId, Long permissionId);

    Role addPermissionToRole(Long roleId, Long permissionId);
}
