export declare interface CreateUserInterface {
    first_name: string;
    last_name: string;
    email: string;
    password?: string
    address?: string;
    phone: string;
    image?: any;
    role: "user" | 'super_admin' | 'admin'
    roles: string[];
}
  