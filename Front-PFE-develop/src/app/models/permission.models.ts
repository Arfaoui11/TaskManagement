import { Role } from "./role.model";
export interface Permission {
    id: number;
    name: string;
    roles?: Role[];
  }
  