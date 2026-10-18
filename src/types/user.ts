export interface AuthUser {
  username: string;
  isLoggedIn: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface LoginFormValues {
  username: string;
  password: string;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
