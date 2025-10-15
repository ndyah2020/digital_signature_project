import { createContext, useContext } from "react";
import { User} from "../type/auth"
import { AuthContext } from "../context/AuthContext";

interface AuthContextType  { 
  user: User | null;
  isLoading : boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
  return context;
};