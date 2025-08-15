package tn.esprit.userservice.IService;

import tn.esprit.userservice.Entity.Permission;

import java.util.List;

public interface IPermissionService {
    List<Permission> getAllPermissions();

    Permission getPermissionById(Long id);

    Permission createPermission(Permission permission);

    Permission updatePermission(Long id, Permission permission);

    void deletePermission(Long id);
}
