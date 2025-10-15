import React, { createContext, useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";
import { User } from "../type/auth";
import { jwtDecode } from "jwt-decode";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const checkUserStatus = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = jwtDecode<User>(token);
        const currentTime = Date.now() / 1000;

        if (userData.exp && userData.exp < currentTime) {
          console.warn("Token đã hết hạn");
          logout();
        } else {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);


  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  // ✅ Kiểm tra định kỳ (mỗi phút)
  useEffect(() => {
    const interval = setInterval(checkUserStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, [checkUserStatus]);

  // ✅ Login, Register
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { token } = res.data;
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    checkUserStatus();
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
