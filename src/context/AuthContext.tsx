import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.ts';

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Verify token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('nexus_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Stored token invalid, clearing session.');
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await authAPI.login({ identifier, password });
      const { token: receivedToken, ...userData } = res.data;
      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('nexus_token', receivedToken);
      localStorage.setItem('nexus_user', JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await authAPI.register(formData);
      const { token: receivedToken, ...userData } = res.data;
      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('nexus_token', receivedToken);
      localStorage.setItem('nexus_user', JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please check all fields.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setUser(null);
    setToken(null);
    authAPI.logout().catch(() => {});
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('nexus_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
