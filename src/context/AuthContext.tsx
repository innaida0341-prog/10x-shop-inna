import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { userStorage } from '../models/storage';
import type { AuthUser, ProfileFormValues } from '../types/user';

interface AuthContextValue {
  user: AuthUser;
  login: (username: string) => void;
  logout: () => void;
  updateProfile: (values: ProfileFormValues) => void;
}

const GUEST: AuthUser = { username: '', isLoggedIn: false };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => userStorage.get() ?? GUEST);

  const persist = useCallback((next: AuthUser) => {
    setUser(next);
    if (next.isLoggedIn) userStorage.set(next);
    else userStorage.remove();
  }, []);

  const login = useCallback(
    (username: string) => persist({ username: username.trim(), isLoggedIn: true }),
    [persist],
  );
  const logout = useCallback(() => persist(GUEST), [persist]);
  const updateProfile = useCallback(
    (values: ProfileFormValues) => persist({ ...user, ...values }),
    [persist, user],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
