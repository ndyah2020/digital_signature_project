import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middlewares";
import { UserRole } from "../entities/User";

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Không xác thực" });
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
}
