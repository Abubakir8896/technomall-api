export declare interface UpdateRoleRequest {
    id: string;
    name?: string;
    permissions?: string[];
    role?: 'user' | 'super_admin' | 'admin'
  }