import React, { useEffect, useState, createContext, useContext } from 'react';
import { api } from '../utils/api';
type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  publicKey: string;
  encryptedPrivateKey?: string;
};
type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  decryptPrivateKey: (password: string) => Promise<string | null>;
};
export const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  // Check if token is valid on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      const {
        token,
        user
      } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };
  const register = async (email: string, name: string, password: string) => {
    setLoading(true);
    try {
      // Generate key pair client-side (this would be handled by crypto.ts)
      // const { publicKey, encryptedPrivateKey } = await generateKeyPair(password)
      const response = await api.post('/auth/register', {
        email,
        name,
        password
        // publicKey,
        // encryptedPrivateKey
      });
      const {
        token,
        user
      } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    api.defaults.headers.common['Authorization'] = '';
  };
  const hasPermission = (permission: string) => {
    if (!user) return false;
    // This is a simplified version. In a real app, you would check permissions based on the user's role
    if (user.role === 'admin') return true;
    const rolePermissions: Record<string, string[]> = {
      admin: ['manage_users', 'create_contract', 'sign_contract', 'view_contract'],
      manager: ['create_contract', 'sign_contract', 'view_contract'],
      user: ['view_contract', 'sign_contract']
    };
    return rolePermissions[user.role]?.includes(permission) || false;
  };
  const decryptPrivateKey = async (password: string): Promise<string | null> => {
    if (!user?.encryptedPrivateKey) return null;
    try {
      // This would be implemented in crypto.ts
      // return await decryptPrivateKeyWithPassword(user.encryptedPrivateKey, password)
      return 'decrypted-private-key'; // Placeholder
    } catch (error) {
      console.error('Error decrypting private key:', error);
      return null;
    }
  };
  return <AuthContext.Provider value={{
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    decryptPrivateKey
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};