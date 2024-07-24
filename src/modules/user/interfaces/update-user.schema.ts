export declare interface UpdateUserInterface {
    id:string
    first_name?: string;
    last_name?: string;
    password?: string
    email?: string;
    address?: string;
    phone?: string;
    image?: any;
    role?: 'user' | 'super_admin' | 'admin'
    roles?: string[];
}
  