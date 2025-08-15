import { User } from "./user.model";
import { Permission } from "./permission.models";
export interface Role {
  id?: number; // Make id optional
    name: string;
    users?: User[];
    permissions: Permission[];
  }