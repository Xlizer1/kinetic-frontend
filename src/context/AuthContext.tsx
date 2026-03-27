import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { User } from '../types/user';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_USER: User = {
  id: 1,
  email: 'demo@kinetic.app',
  username: 'DemoUser',
  avatar_url: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(IS_DEMO ? DEMO_USER : null);
  const [loading, setLoading] = useState(IS_DEMO ? false : true);

  // On mount, try to restore session from stored token
  useEffect(() => {
    if (IS_DEMO) return;
    api.loadFromStorage();
    if (api.token) {
      api
        .getMe()
        .then(setUser)
        .catch(() => api.clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    api.setToken(response.token);
    api.setUserId(response.user.id);
    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const response = await api.register(email, username, password);
    api.setToken(response.token);
    api.setUserId(response.user.id);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    api.clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
