import { useState } from "react";
import { api } from "../utils/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  // ---- Đăng ký ----
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  // ---- Đăng nhập ----
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      return token;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  // ---- Đăng xuất ----
  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return { register, login, logout, isAuthenticated };
}
