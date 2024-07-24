export declare interface CreateRoleRequest {
    name: string;
    permissions: string[]
    role: "user" | 'super_admin' | 'admin'
  }