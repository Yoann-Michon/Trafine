import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  checkAuthStatus,
  login as loginService,
  register as registerService,
  logout as logoutService,
} from '../services/auth-service';
import type { User } from '../types/user-types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const errorRef = useRef<string | null>(null); 

  const getError = () => errorRef.current;
  const setError = (msg: string | null) => {
    errorRef.current = msg;
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await checkAuthStatus();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
     await loginService({ email, password });
     const data= await checkAuthStatus();
      setUser(data);
    } catch (err) {
      setError('Identifiants incorrects');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      await registerService({ email, password, username });
      const u = await checkAuthStatus();
      setUser(u);
    } catch (err) {
      setError('Échec de l’inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutService();
      setUser(null);
    } catch (err) {
      setError('Échec de la déconnexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error: getError(),
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
